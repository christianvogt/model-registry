package api

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"runtime/debug"
	"strings"

	"github.com/google/uuid"
	"github.com/julienschmidt/httprouter"
	"github.com/kubeflow/model-registry/ui/bff/internal/constants"
	helper "github.com/kubeflow/model-registry/ui/bff/internal/helpers"
	"github.com/kubeflow/model-registry/ui/bff/internal/integrations"
	"github.com/rs/cors"
	authenticationv1 "k8s.io/api/authentication/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

func (app *App) RecoverPanic(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				w.Header().Set("Connection", "close")
				app.serverErrorResponse(w, r, fmt.Errorf("%s", err))
				app.logger.Error("Recovered from panic", slog.String("stack_trace", string(debug.Stack())))
			}
		}()

		next.ServeHTTP(w, r)
	})
}

func (app *App) getUserInfoFromToken(ctx context.Context, token string) (string, []string, error) {
	// Get the existing kubeconfig and create a new config with the provided token
	kubeconfig, err := helper.GetKubeconfig()
	if err != nil {
		return "", nil, fmt.Errorf("failed to get kubeconfig: %w", err)
	}

	config := &rest.Config{
		Host:        kubeconfig.Host,
		APIPath:     kubeconfig.APIPath,
		BearerToken: token,
		TLSClientConfig: rest.TLSClientConfig{
			Insecure:   kubeconfig.Insecure,
			ServerName: kubeconfig.ServerName,
			CertFile:   kubeconfig.CertFile,
			KeyFile:    kubeconfig.KeyFile,
			CAFile:     kubeconfig.CAFile,
		},
	}

	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		return "", nil, fmt.Errorf("failed to create kubernetes client: %w", err)
	}

	tokenReview := &authenticationv1.TokenReview{
		Spec: authenticationv1.TokenReviewSpec{
			Token: token,
		},
	}

	response, err := clientset.AuthenticationV1().TokenReviews().Create(ctx, tokenReview, metav1.CreateOptions{})
	if err != nil {
		return "", nil, fmt.Errorf("failed to get user information from token: %w", err)
	}

	if !response.Status.Authenticated {
		return "", nil, fmt.Errorf("token is not valid: %s", response.Status.Error)
	}

	// Get the user and groups from the response
	return response.Status.User.Username, response.Status.User.Groups, nil
}

func (app *App) InjectUserHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Skip use headers check if we are not on /api/v1
		if !strings.HasPrefix(r.URL.Path, ApiPathPrefix) && !strings.HasPrefix(r.URL.Path, PathPrefix+ApiPathPrefix) {
			next.ServeHTTP(w, r)
			return
		}

		var userId string
		var userGroups []string

		if app.config.TokenAuth {
			// If token auth is enabled, try to get user info from token
			token := r.Header.Get("X-Forwarded-Access-Token")
			if token == "" {
				app.badRequestResponse(w, r, errors.New("missing required header: X-Forwarded-Access-Token"))
				return
			}

			userIdFromToken, groupsFromToken, err := app.getUserInfoFromToken(r.Context(), token)
			if err != nil {
				app.badRequestResponse(w, r, err)
				return
			}
			userId = userIdFromToken
			userGroups = groupsFromToken
		} else {
			// Get user info from headers
			userId = r.Header.Get(constants.KubeflowUserIDHeader)
			if userId == "" {
				app.badRequestResponse(w, r, errors.New("missing required header: kubeflow-userid"))
				return
			}

			// Note: The functionality for `kubeflow-groups` is not fully operational at Kubeflow platform at this time
			// but it's supported on Model Registry BFF
			// `kubeflow-groups`: Holds a comma-separated list of user groups.
			userGroupsHeader := r.Header.Get(constants.KubeflowUserGroupsIdHeader)
			if userGroupsHeader != "" {
				userGroups = strings.Split(userGroupsHeader, ",")
				// Trim spaces from each group name
				for i, group := range userGroups {
					userGroups[i] = strings.TrimSpace(group)
				}
			}
		}

		ctx := r.Context()
		ctx = context.WithValue(ctx, constants.KubeflowUserIdKey, userId)
		ctx = context.WithValue(ctx, constants.KubeflowUserGroupsKey, userGroups)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (app *App) EnableCORS(next http.Handler) http.Handler {
	if len(app.config.AllowedOrigins) == 0 {
		// CORS is disabled, this middleware becomes a noop.
		return next
	}

	c := cors.New(cors.Options{
		AllowedOrigins:     app.config.AllowedOrigins,
		AllowCredentials:   true,
		AllowedMethods:     []string{"GET", "PUT", "POST", "PATCH", "DELETE"},
		AllowedHeaders:     []string{constants.KubeflowUserIDHeader, constants.KubeflowUserGroupsIdHeader},
		Debug:              app.config.LogLevel == slog.LevelDebug,
		OptionsPassthrough: false,
	})

	return c.Handler(next)
}

func (app *App) EnableTelemetry(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Adds a unique id to the context to allow tracing of requests
		traceId := uuid.NewString()
		ctx := context.WithValue(r.Context(), constants.TraceIdKey, traceId)

		// logger will only be nil in tests.
		if app.logger != nil {
			traceLogger := app.logger.With(slog.String("trace_id", traceId))
			ctx = context.WithValue(ctx, constants.TraceLoggerKey, traceLogger)

			traceLogger.Debug("Incoming HTTP request", slog.Any("request", helper.RequestLogValuer{Request: r}))
		}
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (app *App) AttachRESTClient(next func(http.ResponseWriter, *http.Request, httprouter.Params)) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {

		modelRegistryID := ps.ByName(ModelRegistryId)

		namespace, ok := r.Context().Value(constants.NamespaceHeaderParameterKey).(string)
		if !ok || namespace == "" {
			app.badRequestResponse(w, r, fmt.Errorf("missing namespace in the context"))
		}

		modelRegistry, err := app.repositories.ModelRegistry.GetModelRegistry(r.Context(), app.kubernetesClient, namespace, modelRegistryID)
		if err != nil {
			app.notFoundResponse(w, r)
			return
		}
		modelRegistryBaseURL := modelRegistry.ServerAddress

		// If we are in dev mode, we need to resolve the server address to the local host
		// to allow the client to connect to the model registry via port forwarded from the cluster to the local machine.
		if app.config.DevMode {
			modelRegistryBaseURL = app.repositories.ModelRegistry.ResolveServerAddress("localhost", int32(app.config.DevModePort))
		}

		// Set up a child logger for the rest client that automatically adds the request id to all statements for
		// tracing.
		restClientLogger := app.logger
		traceId, ok := r.Context().Value(constants.TraceIdKey).(string)
		if app.logger != nil {
			if ok {
				restClientLogger = app.logger.With(slog.String("trace_id", traceId))
			} else {
				app.logger.Warn("Failed to set trace_id for tracing")
			}
		}

		headers := http.Header{}
		if app.config.TokenAuth && r.Header.Get("X-Forwarded-Access-Token") != "" {
			headers.Set("Authorization", fmt.Sprintf("Bearer %s", r.Header.Get("X-Forwarded-Access-Token")))
		}
		client, err := integrations.NewHTTPClient(restClientLogger, modelRegistryID, modelRegistryBaseURL, headers)
		if err != nil {
			app.serverErrorResponse(w, r, fmt.Errorf("failed to create Kubernetes client: %v", err))
			return
		}
		ctx := context.WithValue(r.Context(), constants.ModelRegistryHttpClientKey, client)
		next(w, r.WithContext(ctx), ps)
	}
}

func (app *App) AttachNamespace(next func(http.ResponseWriter, *http.Request, httprouter.Params)) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		namespace := r.URL.Query().Get(string(constants.NamespaceHeaderParameterKey))
		if namespace == "" {
			app.badRequestResponse(w, r, fmt.Errorf("missing required query parameter: %s", constants.NamespaceHeaderParameterKey))
			return
		}

		ctx := context.WithValue(r.Context(), constants.NamespaceHeaderParameterKey, namespace)
		r = r.WithContext(ctx)

		next(w, r, ps)
	}
}

func (app *App) PerformSARonGetListServicesByNamespace(next func(http.ResponseWriter, *http.Request, httprouter.Params)) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
		user, ok := r.Context().Value(constants.KubeflowUserIdKey).(string)
		if !ok || user == "" {
			app.badRequestResponse(w, r, fmt.Errorf("missing user in context"))
			return
		}
		namespace, ok := r.Context().Value(constants.NamespaceHeaderParameterKey).(string)
		if !ok || namespace == "" {
			app.badRequestResponse(w, r, fmt.Errorf("missing namespace in context"))
			return
		}

		var userGroups []string
		if groups, ok := r.Context().Value(constants.KubeflowUserGroupsKey).([]string); ok {
			userGroups = groups
		} else {
			userGroups = []string{}
		}

		allowed, err := app.kubernetesClient.PerformSARonGetListServicesByNamespace(user, userGroups, namespace)
		if err != nil {
			app.forbiddenResponse(w, r, fmt.Sprintf("failed to perform SAR: %v", err))
			return
		}
		if !allowed {
			app.forbiddenResponse(w, r, "access denied")
			return
		}

		next(w, r, ps)
	}
}

func (app *App) PerformSARonSpecificService(next func(http.ResponseWriter, *http.Request, httprouter.Params)) httprouter.Handle {
	return func(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {

		user, ok := r.Context().Value(constants.KubeflowUserIdKey).(string)
		if !ok || user == "" {
			app.badRequestResponse(w, r, fmt.Errorf("missing user in context"))
			return
		}

		namespace, ok := r.Context().Value(constants.NamespaceHeaderParameterKey).(string)
		if !ok || namespace == "" {
			app.badRequestResponse(w, r, fmt.Errorf("missing namespace in context"))
			return
		}

		modelRegistryID := ps.ByName(ModelRegistryId)
		if !ok || modelRegistryID == "" {
			app.badRequestResponse(w, r, fmt.Errorf("missing namespace in context"))
			return
		}

		var userGroups []string
		if groups, ok := r.Context().Value(constants.KubeflowUserGroupsKey).([]string); ok {
			userGroups = groups
		} else {
			userGroups = []string{}
		}

		allowed, err := app.kubernetesClient.PerformSARonSpecificService(user, userGroups, namespace, modelRegistryID)
		if err != nil {
			app.forbiddenResponse(w, r, "failed to perform SAR: %v")
			return
		}
		if !allowed {
			app.forbiddenResponse(w, r, "access denied")
			return
		}

		next(w, r, ps)
	}
}

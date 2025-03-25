package repositories

import (
	"github.com/kubeflow/model-registry/ui/bff/internal/mocks"
	"github.com/kubeflow/model-registry/ui/bff/internal/models"
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var _ = Describe("ModelRegistryRepository", func() {
	var (
		repo *ModelRegistryRepository
	)

	BeforeEach(func() {
		repo = NewModelRegistryRepository()
	})

	Describe("GetAllModelRegistries", func() {
		Context("with existing model registries", Ordered, func() {

			It("should retrieve the get all kubeflow service successfully", func() {

				By("fetching all model registries in the repository")
				registries, err := repo.GetAllModelRegistries(mocks.NewMockSessionContextNoParent(), k8sClient, "kubeflow")
				Expect(err).NotTo(HaveOccurred())

				By("should match the expected model registries")
				expectedRegistries := []models.ModelRegistryModel{
					{Name: "model-registry", Description: "Model Registry Description", DisplayName: "Model Registry", ServerAddress: "http://127.0.0.1:8080/api/model_registry/v1alpha3"},
					{Name: "model-registry-one", Description: "Model Registry One description", DisplayName: "Model Registry One", ServerAddress: "http://127.0.0.1:8080/api/model_registry/v1alpha3"},
				}
				Expect(registries).To(ConsistOf(expectedRegistries))
			})

			It("should retrieve the get all dora-namespace service successfully", func() {

				By("fetching all model registries in the repository")
				registries, err := repo.GetAllModelRegistries(mocks.NewMockSessionContextNoParent(), k8sClient, "dora-namespace")
				Expect(err).NotTo(HaveOccurred())

				By("should match the expected model registries")
				expectedRegistries := []models.ModelRegistryModel{
					{Name: "model-registry-dora", Description: "Model Registry Dora description", DisplayName: "Model Registry Dora", ServerAddress: "http://127.0.0.1:8080/api/model_registry/v1alpha3"},
				}
				Expect(registries).To(ConsistOf(expectedRegistries))
			})

			It("should not retrieve namespaces", func() {

				By("fetching all model registries in the repository")
				registries, err := repo.GetAllModelRegistries(mocks.NewMockSessionContextNoParent(), k8sClient, "no-namespace")
				Expect(err).NotTo(HaveOccurred())

				By("should be empty")
				Expect(registries).To(BeEmpty())
			})
		})
	})

	Describe("ResolveServerAddress", func() {
		It("should resolve the server address with port", func() {
			expectedURL := "http://localhost:8080/api/model_registry/v1alpha3"
			actualURL := repo.ResolveServerAddress("localhost", 8080)
			Expect(actualURL).To(Equal(expectedURL))
		})

		It("should resolve the server address without port", func() {
			expectedURL := "http://localhost/api/model_registry/v1alpha3"
			actualURL := repo.ResolveServerAddress("localhost", 0)
			Expect(actualURL).To(Equal(expectedURL))
		})
	})
})

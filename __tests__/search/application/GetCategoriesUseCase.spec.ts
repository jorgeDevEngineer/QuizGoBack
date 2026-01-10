
import { GetCategoriesUseCase, CategoriesDTO } from '../../../src/lib/search/application/GetCategoriesUseCase';
import { QuizRepository } from '../../../src/lib/search/domain/port/QuizRepository';

describe('GetCategoriesUseCase (Application Layer)', () => {
    let quizRepositoryStub: jest.Mocked<QuizRepository>;

    beforeEach(() => {
        // ARRANGE - Crear stub del repositorio
        quizRepositoryStub = {
            search: jest.fn(),
            findFeatured: jest.fn(),
            getCategories: jest.fn(),
        };
    });

    it('should return all available categories', async () => {
        // ARRANGE
        const MockCategorias = [
            { name: 'Tecnologia' },
            { name: 'Ciencia' },
            { name: 'Historia' },
            { name: 'Arte' },
        ];
        quizRepositoryStub.getCategories.mockResolvedValue(MockCategorias);

        const useCase = new GetCategoriesUseCase(quizRepositoryStub);

        // ACT
        const result = await useCase.execute();

        // ASSERT
        expect(result.isSuccess).toBe(true);
        const categoriesResult = result.getValue();
        expect(categoriesResult).not.toBeNull();
        expect(categoriesResult!.categories).toHaveLength(4);
        expect(categoriesResult!.categories).toEqual(MockCategorias);
        expect(quizRepositoryStub.getCategories).toHaveBeenCalledTimes(1);
    });

    it('should return an empty list when no categories exist', async () => {
        // ARRANGE
        quizRepositoryStub.getCategories.mockResolvedValue([]);

        const useCase = new GetCategoriesUseCase(quizRepositoryStub);

        // ACT
        const result = await useCase.execute();

        // ASSERT
        expect(result.isSuccess).toBe(true);
        expect(result.getValue()!.categories).toHaveLength(0);
        expect(result.getValue()!.categories).toEqual([]);
    });

    it('should return categories with correct structure', async () => {
        // ARRANGE
        const MockCategorias = [
            { name: 'Tecnologia' },
            { name: 'Ciencia' },
        ];
        quizRepositoryStub.getCategories.mockResolvedValue(MockCategorias);

        const useCase = new GetCategoriesUseCase(quizRepositoryStub);

        // ACT
        const result = await useCase.execute();

        // ASSERT
        expect(result.isSuccess).toBe(true);
        const categories = result.getValue()!.categories;
        categories.forEach((category) => {
            expect(category).toHaveProperty('name');
            expect(typeof category.name).toBe('string');
        });
    });

    it('should handle a single category', async () => {
        // ARRANGE
        const MockCategorias = [{ name: 'General' }];
        quizRepositoryStub.getCategories.mockResolvedValue(MockCategorias);

        const useCase = new GetCategoriesUseCase(quizRepositoryStub);

        // ACT
        const result = await useCase.execute();

        // ASSERT
        expect(result.isSuccess).toBe(true);
        expect(result.getValue()!.categories).toHaveLength(1);
        expect(result.getValue()!.categories[0].name).toBe('General');
    });
});


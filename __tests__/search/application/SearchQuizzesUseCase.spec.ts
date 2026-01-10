
import { SearchQuizzesUseCase, SearchParamsDto, SearchResultDto } from '../../../src/lib/search/application/SearchQuizzesUseCase';
import { QuizRepository } from '../../../src/lib/search/domain/port/QuizRepository';

const crearMockResultadosBusqueda = (count: number = 2): SearchResultDto => ({
    data: Array.from({ length: count }, (_, i) => ({
        id: `quiz-${i + 1}`,
        title: `Quiz ${i + 1}`,
        description: `Descripción del quiz ${i + 1}`,
        themeId: 'theme-1',
        category: 'General',
        author: {
            id: `author-${i + 1}`,
            name: `Autor ${i + 1}`,
        },
        coverImageId: null,
        playCount: i * 10,
        createdAt: new Date('2024-01-01'),
        visibility: 'public',
        Status: 'published',
    })),
    pagination: {
        page: 1,
        limit: 10,
        totalCount: count,
        totalPages: 1,
    },
});

describe('SearchQuizzesUseCase (Application Layer)', () => {
    let quizRepositoryStub: jest.Mocked<QuizRepository>;

    beforeEach(() => {
        // ARRANGE - Crear stub del repositorio
        quizRepositoryStub = {
            search: jest.fn(),
            findFeatured: jest.fn(),
            getCategories: jest.fn(),
        };
    });

    it('should return quizzes matching the search query', async () => {
        // ARRANGE
        const searchParams: SearchParamsDto = {
            q: 'matematicas',
            order: 'desc',
        };
        const Result = crearMockResultadosBusqueda(2);
        quizRepositoryStub.search.mockResolvedValue(Result);

        const useCase = new SearchQuizzesUseCase(quizRepositoryStub);

        // ACT
        const result = await useCase.execute(searchParams);

        // ASSERT
        expect(result.isSuccess).toBe(true);
        const searchResult = result.getValue();
        expect(searchResult).not.toBeNull();
        expect(searchResult!.data).toHaveLength(2);
        expect(searchResult!.pagination.totalCount).toBe(2);
        expect(quizRepositoryStub.search).toHaveBeenCalledWith(searchParams);
    });

    it('should return quizzes filtered by categories', async () => {
        // ARRANGE
        const searchParams: SearchParamsDto = {
            categories: ['Science', 'Math'],
            order: 'asc',
        };
        const Result = crearMockResultadosBusqueda(3);
        quizRepositoryStub.search.mockResolvedValue(Result);

        const useCase = new SearchQuizzesUseCase(quizRepositoryStub);

        // ACT
        const result = await useCase.execute(searchParams);

        // ASSERT
        expect(result.isSuccess).toBe(true);
        expect(result.getValue()!.data).toHaveLength(3);
        expect(quizRepositoryStub.search).toHaveBeenCalledWith(searchParams);
    });

    it('should return paginated results correctly', async () => {
        // ARRANGE
        const searchParams: SearchParamsDto = {
            limit: 5,
            page: 2,
            order: 'desc',
        };
        const Result: SearchResultDto = {
            ...crearMockResultadosBusqueda(5),
            pagination: {
                page: 2,
                limit: 5,
                totalCount: 15,
                totalPages: 3,
            },
        };
        quizRepositoryStub.search.mockResolvedValue(Result);

        const useCase = new SearchQuizzesUseCase(quizRepositoryStub);

        // ACT
        const result = await useCase.execute(searchParams);

        // ASSERT
        expect(result.isSuccess).toBe(true);
        const searchResult = result.getValue();
        expect(searchResult!.pagination.page).toBe(2);
        expect(searchResult!.pagination.limit).toBe(5);
        expect(searchResult!.pagination.totalPages).toBe(3);
    });

    it('should return an empty list when no quizzes match the search', async () => {
        // ARRANGE
        const searchParams: SearchParamsDto = {
            q: 'nonexistent-quiz-xyz',
            order: 'desc',
        };
        const Result = crearMockResultadosBusqueda(0);
        quizRepositoryStub.search.mockResolvedValue(Result);

        const useCase = new SearchQuizzesUseCase(quizRepositoryStub);

        // ACT
        const result = await useCase.execute(searchParams);

        // ASSERT
        expect(result.isSuccess).toBe(true);
        expect(result.getValue()!.data).toHaveLength(0);
        expect(result.getValue()!.pagination.totalCount).toBe(0);
    });

    it('should support ordering by different fields', async () => {
        // ARRANGE
        const searchParams: SearchParamsDto = {
            orderBy: 'playCount',
            order: 'desc',
        };
        const Result = crearMockResultadosBusqueda(2);
        quizRepositoryStub.search.mockResolvedValue(Result);

        const useCase = new SearchQuizzesUseCase(quizRepositoryStub);

        // ACT
        const result = await useCase.execute(searchParams);

        // ASSERT
        expect(result.isSuccess).toBe(true);
        expect(quizRepositoryStub.search).toHaveBeenCalledWith(
            expect.objectContaining({
                orderBy: 'playCount',
                order: 'desc',
            })
        );
    });
});


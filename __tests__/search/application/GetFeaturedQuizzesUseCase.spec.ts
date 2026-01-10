
import { GetFeaturedQuizzesUseCase, GetFeaturedQuizzesParams } from '../../../src/lib/search/application/GetFeaturedQuizzesUseCase';
import { SearchResultDto } from '../../../src/lib/search/application/SearchQuizzesUseCase';
import { QuizRepository } from '../../../src/lib/search/domain/port/QuizRepository';


const crearMockQuizzesDestacados = (count: number = 5): SearchResultDto => ({
    data: Array.from({ length: count }, (_, i) => ({
        id: `Quiz-${i + 1}`,
        title: `Quiz Destacado ${i + 1}`,
        description: `Descripción del quiz destacado ${i + 1}`,
        themeId: 'theme-destacado',
        category: 'Destacado',
        author: {
            id: `author-${i + 1}`,
            name: `Autor Destacado ${i + 1}`,
        },
        coverImageId: `cover-${i + 1}`,
        playCount: 1000 + i * 100,
        createdAt: new Date(),
        visibility: 'public',
        Status: 'published',
    })),
    pagination: {
        page: 1,
        limit: count,
        totalCount: count,
        totalPages: 1,
    },
});

describe('GetFeaturedQuizzesUseCase (Application Layer)', () => {
    let quizRepositoryStub: jest.Mocked<QuizRepository>;

    beforeEach(() => {
        // ARRANGE - Crear stub del repositorio
        quizRepositoryStub = {
            search: jest.fn(),
            findFeatured: jest.fn(),
            getCategories: jest.fn(),
        };
    });

    it('should return featured quizzes with the specified limit', async () => {
        // ARRANGE
        const params: GetFeaturedQuizzesParams = { limit: 5 };
        const Result = crearMockQuizzesDestacados(5);
        quizRepositoryStub.findFeatured.mockResolvedValue(Result);

        const useCase = new GetFeaturedQuizzesUseCase(quizRepositoryStub);

        // ACT
        const result = await useCase.execute(params);

        // ASSERT
        expect(result.isSuccess).toBe(true);
        const featuredQuizzes = result.getValue();
        expect(featuredQuizzes).not.toBeNull();
        expect(featuredQuizzes!.data).toHaveLength(5);
        expect(quizRepositoryStub.findFeatured).toHaveBeenCalledWith(5);
    });

    it('should limit the maximum number of quizzes to 10', async () => {
        // ARRANGE
        const params: GetFeaturedQuizzesParams = { limit: 20 }; // Intenta pedir 20
        const Result = crearMockQuizzesDestacados(10);
        quizRepositoryStub.findFeatured.mockResolvedValue(Result);

        const useCase = new GetFeaturedQuizzesUseCase(quizRepositoryStub);

        // ACT
        const result = await useCase.execute(params);

        // ASSERT
        expect(result.isSuccess).toBe(true);
        // El caso de uso debe limitar a 10 máximo
        expect(quizRepositoryStub.findFeatured).toHaveBeenCalledWith(10);
    });

    it('should return a failure Result when no featured quizzes are found', async () => {
        // ARRANGE
        const params: GetFeaturedQuizzesParams = { limit: 5 };
        quizRepositoryStub.findFeatured.mockResolvedValue(null as any);

        const useCase = new GetFeaturedQuizzesUseCase(quizRepositoryStub);

        // ACT
        const result = await useCase.execute(params);

        // ASSERT
        expect(result.isFailure).toBe(true);
        expect(result.error).not.toBeNull();
        expect(result.error!.message).toBe('Featured quizzes not found');
    });

    it('should handle a request for a single featured quiz', async () => {
        // ARRANGE
        const params: GetFeaturedQuizzesParams = { limit: 1 };
        const Result = crearMockQuizzesDestacados(1);
        quizRepositoryStub.findFeatured.mockResolvedValue(Result);

        const useCase = new GetFeaturedQuizzesUseCase(quizRepositoryStub);

        // ACT
        const result = await useCase.execute(params);

        // ASSERT
        expect(result.isSuccess).toBe(true);
        expect(result.getValue()!.data).toHaveLength(1);
        expect(quizRepositoryStub.findFeatured).toHaveBeenCalledWith(1);
    });

    it('should return featured quizzes with correct data structure', async () => {
        // ARRANGE
        const params: GetFeaturedQuizzesParams = { limit: 3 };
        const Result = crearMockQuizzesDestacados(3);
        quizRepositoryStub.findFeatured.mockResolvedValue(Result);

        const useCase = new GetFeaturedQuizzesUseCase(quizRepositoryStub);

        // ACT
        const result = await useCase.execute(params);

        // ASSERT
        expect(result.isSuccess).toBe(true);
        const quizzes = result.getValue()!.data;
        
        quizzes.forEach((quiz) => {
            expect(quiz).toHaveProperty('id');
            expect(quiz).toHaveProperty('title');
            expect(quiz).toHaveProperty('description');
            expect(quiz).toHaveProperty('author');
            expect(quiz.author).toHaveProperty('id');
            expect(quiz.author).toHaveProperty('name');
            expect(quiz).toHaveProperty('playCount');
            expect(quiz).toHaveProperty('category');
        });
    });

    it('should respect exact limit when under maximum', async () => {
        // ARRANGE
        const params: GetFeaturedQuizzesParams = { limit: 7 };
        const Result = crearMockQuizzesDestacados(7);
        quizRepositoryStub.findFeatured.mockResolvedValue(Result);

        const useCase = new GetFeaturedQuizzesUseCase(quizRepositoryStub);

        // ACT
        const result = await useCase.execute(params);

        // ASSERT
        expect(result.isSuccess).toBe(true);
        expect(quizRepositoryStub.findFeatured).toHaveBeenCalledWith(7);
        expect(result.getValue()!.data).toHaveLength(7);
    });
});


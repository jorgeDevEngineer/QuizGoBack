
import { vi } from 'vitest';

export const mockQuizRepository = {
  save: vi.fn(),
  find: vi.fn(),
  findAll: vi.fn(),
  delete: vi.fn(),
};

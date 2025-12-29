
import { Media } from '../../../../src/lib/media/domain/entity/Media';
import { MediaId, MimeType, FileSize } from '../../../../src/lib/media/domain/valueObject/Media';
import { DomainException } from '../../../../src/common/domain/domain.exception';

describe('Media Entity (Domain Layer)', () => {
  // ARRANGE: Create mock data for tests
  const mockData = Buffer.from('this is a test file');
  const mockThumbnail = Buffer.from('this is a thumbnail');
  const validMimeType = 'image/png';
  const validSize = mockData.length;
  const validOriginalName = 'test-file.png';
  const validId = '123e4567-e89b-42d3-a456-426614174123';

  describe('create Factory', () => {
    it('should create a Media object successfully with valid data', () => {
      // ACT
      const media = Media.create(
        mockData,
        validMimeType,
        validSize,
        validOriginalName,
        mockThumbnail,
        validId
      );

      // ASSERT
      expect(media).toBeInstanceOf(Media);
      expect(media.id.value).toBe(validId);
      expect(media.mimeType.value).toBe(validMimeType);
      expect(media.size.value).toBe(validSize);
      expect(media.originalName).toBe(validOriginalName);
      expect(media.data).toBe(mockData);
      expect(media.thumbnail).toBe(mockThumbnail);
    });

    it('should generate a new ID if one is not provided', () => {
        // ACT
        const media = Media.create(
          mockData,
          validMimeType,
          validSize,
          validOriginalName,
          null
        );
  
        // ASSERT
        expect(media).toBeInstanceOf(Media);
        expect(media.id).toBeInstanceOf(MediaId);
    });

    it('should THROW a DomainException for an unsupported MIME type', () => {
        // ARRANGE
        const createWithInvalidMime = () => {
            Media.create(
                mockData,
                'application/pdf', // Invalid MIME type
                validSize,
                validOriginalName,
                null
            );
        };
  
        // ACT & ASSERT
        expect(createWithInvalidMime).toThrow(DomainException);
        expect(createWithInvalidMime).toThrow('Unsupported MIME type: application/pdf');
      });
  });

  describe('fromPrimitives Factory', () => {
    it('should reconstitute a Media object from primitives', () => {
      // ARRANGE
      const primitives = {
        id: validId,
        data: mockData,
        thumbnail: mockThumbnail,
        mimeType: validMimeType,
        size: validSize,
        originalName: validOriginalName,
        createdAt: new Date(),
      };

      // ACT
      const media = Media.fromPrimitives(primitives);

      // ASSERT
      expect(media).toBeInstanceOf(Media);
      expect(media.id.value).toBe(validId);
      expect(media.mimeType.value).toBe(validMimeType);
      expect(media.size.value).toBe(validSize);
    });
  });

  describe('properties Method', () => {
    it('should return the correct properties object', () => {
      // ARRANGE
      const media = Media.create(
        mockData,
        validMimeType,
        validSize,
        validOriginalName,
        mockThumbnail,
        validId
      );

      // ACT
      const props = media.properties();

      // ASSERT
      expect(props.id).toBe(validId);
      expect(props.mimeType).toBe(validMimeType);
      expect(props.size).toBe(validSize);
      expect(props.originalName).toBe(validOriginalName);
      expect(props.data).toBe(mockData);
      expect(props.thumbnail).toBe(mockThumbnail);
      expect(props.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('toListResponse Method', () => {
    it('should return the correct list response DTO', () => {
      // ARRANGE
      const media = Media.create(
        mockData,
        validMimeType,
        validSize,
        validOriginalName,
        mockThumbnail,
        validId
      );

      // ACT
      const responseDto = media.toListResponse();

      // ASSERT
      expect(responseDto.id).toBe(validId);
      expect(responseDto.url).toBe(`/media/${validId}`);
      expect(responseDto.mimeType).toBe(validMimeType);
      expect(responseDto.size).toBe(validSize);
      expect(responseDto.originalName).toBe(validOriginalName);
      expect(responseDto.thumbnailUrl).toContain('data:image/jpeg;base64,');
      expect(responseDto.createdAt).toBeInstanceOf(Date);
    });

    it('should return null for thumbnailUrl if thumbnail is null', () => {
        // ARRANGE
        const media = Media.create(
          mockData,
          validMimeType,
          validSize,
          validOriginalName,
          null, // No thumbnail
          validId
        );
  
        // ACT
        const responseDto = media.toListResponse();
  
        // ASSERT
        expect(responseDto.thumbnailUrl).toBeNull();
      });
  });
});

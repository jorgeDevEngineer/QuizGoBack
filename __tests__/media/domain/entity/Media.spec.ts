
import { Media } from '../../../../src/lib/media/domain/entity/Media';
import { MediaId, MediaUrl, MimeType, UserId } from '../../../../src/lib/media/domain/valueObject/Media';
import { DomainException } from '../../../../src/common/domain/domain.exception';

describe('Media Entity (Domain Layer)', () => {
  // ARRANGE: Create real instances of Value Objects
  const validMediaId = MediaId.of('media-uuid-1');
  const validUserId = UserId.of('user-uuid-1');
  const validUrl = new MediaUrl('http://example.com/image.png');
  const validMimeType = new MimeType('image/png');

  it('should create a Media object successfully with valid data', () => {
    // ACT: Use the public factory method
    const media = Media.create(
      validMediaId,
      validUserId,
      validUrl,
      validMimeType
    );

    // ASSERT (Output-Based Testing)
    expect(media).toBeInstanceOf(Media);
    expect(media.id.equals(validMediaId)).toBe(true);
    expect(media.toPlainObject().url).toBe('http://example.com/image.png');
  });

  it('should THROW a DomainException for an invalid URL string in the Value Object', () => {
    // ARRANGE: An action that attempts to create a VO with invalid data
    const createInvalidUrlAction = () => {
      new MediaUrl('not-a-valid-url');
    };

    // ACT & ASSERT
    expect(createInvalidUrlAction).toThrow(DomainException);
    expect(createInvalidUrlAction).toThrow('Invalid URL format.');
  });

  it('should THROW a DomainException for an unsupported MIME type', () => {
    // ARRANGE
    const createInvalidMimeTypeAction = () => {
      new MimeType('application/pdf'); // Assuming this is not supported
    };

    // ACT & ASSERT
    expect(createInvalidMimeTypeAction).toThrow(DomainException);
    expect(createInvalidMimeTypeAction).toThrow('Unsupported MIME type.');
  });

  it('should expose its properties through public getters', () => {
    // ARRANGE
    const media = Media.create(validMediaId, validUserId, validUrl, validMimeType);

    // ACT & ASSERT
    expect(media.id).toBe(validMediaId);
    expect(media.userId).toBe(validUserId);
    expect(media.url).toBe(validUrl);
    expect(media.mimeType).toBe(validMimeType);
  });
});

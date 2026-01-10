
import { MediaId, AuthorId, MediaName, MediaUrl, MediaMimeType, MediaSize, MediaFormat, MediaCategory, CreatedAt } from '../value-object/MediaId';

export interface MediaProps {
  mediaId: MediaId;
  authorId: AuthorId;
  name: MediaName;
  url: MediaUrl;
  mimeType: MediaMimeType;
  size: MediaSize;
  format: MediaFormat;
  category: MediaCategory;
  createdAt: CreatedAt;
}

export class Media {
  private props: MediaProps;

  private constructor(props: MediaProps) {
    this.props = props;
  }

  public static create(authorId: AuthorId, name: MediaName, url: MediaUrl, mimeType: MediaMimeType, size: MediaSize, format: MediaFormat, category: MediaCategory): Media {
    return new Media({
      mediaId: MediaId.generate(),
      authorId: authorId,
      name: name,
      url: url,
      mimeType: mimeType,
      size: size,
      format: format,
      category: category,
      createdAt: CreatedAt.now()
    });
  }

  public static fromDb(mediaId: MediaId, authorId: AuthorId, name: MediaName, url: MediaUrl, mimeType: MediaMimeType, size: MediaSize, format: MediaFormat, category: MediaCategory, createdAt: CreatedAt): Media {
    return new Media({ mediaId, authorId, name, url, mimeType, size, format, category, createdAt });
  }
  
  public toPlainObject(): { [key: string]: any } {
    return {
      mediaId: this.props.mediaId.getId(),
      authorId: this.props.authorId.getId(),
      name: this.props.name.getValue(),
      url: this.props.url.getValue(),
      mimeType: this.props.mimeType.getValue(),
      size: this.props.size.getValue(),
      format: this.props.format.getValue(),
      category: this.props.category.getValue(),
      createdAt: this.props.createdAt.getValue()
    };
  }

  public properties(): { [key: string]: any } {
    const props = this.toPlainObject();
    return {
      id: props.mediaId,
      originalName: props.name,
      url: props.url,
      mimeType: props.mimeType,
      size: props.size,
      format: props.format,
      category: props.category,
      authorId: props.authorId,
      createdAt: props.createdAt,
    };
  }

  public toResponse() {
    return {
      mediaId: this.props.mediaId.getId(),
      url: this.props.url.getValue(),
    };
  }
}

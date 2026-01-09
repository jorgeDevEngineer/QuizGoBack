
import { MediaId, AuthorId, MediaName, MediaUrl, MediaCategory, CreatedAt } from '../value-object/MediaId';

export interface MediaProps {
  id: MediaId;
  authorId: AuthorId;
  name: MediaName;
  url: MediaUrl;
  category: MediaCategory;
  createdAt: CreatedAt;
}

export class Media {
  private props: MediaProps;

  private constructor(props: MediaProps) {
    this.props = props;
  }

  public static create(authorId: AuthorId, name: MediaName, url: MediaUrl, category: MediaCategory): Media {
    return new Media({
        id: MediaId.generate(),
        authorId: authorId,
        name: name,
        url: url,
        category: category,
        createdAt: CreatedAt.now()
    });
  }

  public static fromDb(id: MediaId, authorId: AuthorId, name: MediaName, url: MediaUrl, category: MediaCategory, createdAt: CreatedAt): Media {
    return new Media({ id, authorId, name, url, category, createdAt });
  }
  
  public properties(): { [key: string]: any } {
    return {
        id: this.props.id.getId(),
        authorId: this.props.authorId.getId(),
        name: this.props.name.getValue(),
        url: this.props.url.getValue(),
        category: this.props.category.getValue(),
        createdAt: this.props.createdAt.getValue()
    };
  }

  public toResponse() {
    return {
      id: this.props.id.getId(),
      url: this.props.url.getValue(),
    };
  }
}

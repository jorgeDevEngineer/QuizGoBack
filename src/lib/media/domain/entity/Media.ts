import { randomUUID } from 'crypto';

export type MediaType = 'single' | 'multiple';

export interface MediaProps {
    id: string;
    url: string;
    key: string;
    type: MediaType;
    category: string;
    mimeType: string;
    size: number;
    authorId: string;
    originalName: string;
    createdAt: Date;
    thumbnailUrl: string | null;
}

export class Media {
    private props: MediaProps;

    private constructor(props: MediaProps) {
        this.props = props;
    }

    public static create(
        url: string,
        key: string,
        category: string,
        mimeType: string,
        size: number,
        authorId: string,
        originalName: string,
        thumbnailUrl: string | null
    ): Media {
        return new Media({
            id: randomUUID(),
            url,
            key,
            type: 'single',
            category,
            mimeType,
            size,
            authorId,
            originalName,
            createdAt: new Date(),
            thumbnailUrl
        });
    }

    public static fromPrimitives(props: MediaProps): Media {
        return new Media(props);
    }

    public properties(): MediaProps {
        return this.props;
    }

    public toResponse() {
        return {
            id: this.props.id,
            url: this.props.url,
            mimeType: this.props.mimeType,
            size: this.props.size,
            originalName: this.props.originalName,
            createdAt: this.props.createdAt,
            thumbnailUrl: this.props.thumbnailUrl
        };
    }
}

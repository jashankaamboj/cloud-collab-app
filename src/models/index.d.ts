import { ModelInit, MutableModel, __modelMeta__, ManagedIdentifier } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled, AsyncCollection, AsyncItem } from "@aws-amplify/datastore";

export enum Permission {
  READ = "READ",
  WRITE = "WRITE"
}



type EagerDocument = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Document, 'id'>;
  };
  readonly id: string;
  readonly title: string;
  readonly content?: string | null;
  readonly description?: string | null;
  readonly tags?: (string | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly owner?: string | null;
  readonly shares?: (Share | null)[] | null;
}

type LazyDocument = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Document, 'id'>;
  };
  readonly id: string;
  readonly title: string;
  readonly content?: string | null;
  readonly description?: string | null;
  readonly tags?: (string | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly owner?: string | null;
  readonly shares: AsyncCollection<Share>;
}

export declare type Document = LazyLoading extends LazyLoadingDisabled ? EagerDocument : LazyDocument

export declare const Document: (new (init: ModelInit<Document>) => Document) & {
  copyOf(source: Document, mutator: (draft: MutableModel<Document>) => MutableModel<Document> | void): Document;
}

type EagerShare = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Share, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly documentId: string;
  readonly document?: Document | null;
  readonly userEmail: string;
  readonly permission: Permission | keyof typeof Permission;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyShare = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Share, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly documentId: string;
  readonly document: AsyncItem<Document | undefined>;
  readonly userEmail: string;
  readonly permission: Permission | keyof typeof Permission;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Share = LazyLoading extends LazyLoadingDisabled ? EagerShare : LazyShare

export declare const Share: (new (init: ModelInit<Share>) => Share) & {
  copyOf(source: Share, mutator: (draft: MutableModel<Share>) => MutableModel<Share> | void): Share;
}
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDocument = /* GraphQL */ `
  query GetDocument($id: ID!) {
    getDocument(id: $id) {
      id
      title
      content
      description
      tags
      createdAt
      updatedAt
      owner
      shares {
        items {
          id
          userEmail
          permission
          createdAt
          updatedAt
          owner
          __typename
        }
        nextToken
        __typename
      }
      __typename
    }
  }
`;

export const listDocuments = /* GraphQL */ `
  query ListDocuments(
    $filter: ModelDocumentFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDocuments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        content
        description
        tags
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;

export const getShare = /* GraphQL */ `
  query GetShare($id: ID!) {
    getShare(id: $id) {
      id
      documentId
      document {
        id
        title
        content
        description
        tags
        createdAt
        updatedAt
        owner
        __typename
      }
      userEmail
      permission
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;

export const listShares = /* GraphQL */ `
  query ListShares(
    $filter: ModelShareFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listShares(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        documentId
        userEmail
        permission
        createdAt
        updatedAt
        owner
        document {
          id
          title
          content
          description
          tags
          createdAt
          updatedAt
          owner
          __typename
        }
        __typename
      }
      nextToken
      __typename
    }
  }
`;

export const sharesByDocumentId = /* GraphQL */ `
  query SharesByDocumentId(
    $documentId: ID!
    $sortDirection: ModelSortDirection
    $filter: ModelShareFilterInput
    $limit: Int
    $nextToken: String
  ) {
    sharesByDocumentId(
      documentId: $documentId
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        documentId
        userEmail
        permission
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;

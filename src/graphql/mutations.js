/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const shareDocument = /* GraphQL */ `
  mutation ShareDocument(
    $documentId: ID!
    $userEmail: String!
    $permission: Permission!
  ) {
    shareDocument(
      documentId: $documentId
      userEmail: $userEmail
      permission: $permission
    ) {
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
export const unshareDocument = /* GraphQL */ `
  mutation UnshareDocument($documentId: ID!, $userEmail: String!) {
    unshareDocument(documentId: $documentId, userEmail: $userEmail) {
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
export const createDocument = /* GraphQL */ `
  mutation CreateDocument(
    $input: CreateDocumentInput!
    $condition: ModelDocumentConditionInput
  ) {
    createDocument(input: $input, condition: $condition) {
      id
      title
      content
      description
      tags
      createdAt
      updatedAt
      owner
      shares {
        nextToken
        __typename
      }
      __typename
    }
  }
`;
export const updateDocument = /* GraphQL */ `
  mutation UpdateDocument(
    $input: UpdateDocumentInput!
    $condition: ModelDocumentConditionInput
  ) {
    updateDocument(input: $input, condition: $condition) {
      id
      title
      content
      description
      tags
      createdAt
      updatedAt
      owner
      shares {
        nextToken
        __typename
      }
      __typename
    }
  }
`;
export const deleteDocument = /* GraphQL */ `
  mutation DeleteDocument(
    $input: DeleteDocumentInput!
    $condition: ModelDocumentConditionInput
  ) {
    deleteDocument(input: $input, condition: $condition) {
      id
      title
      content
      description
      tags
      createdAt
      updatedAt
      owner
      shares {
        nextToken
        __typename
      }
      __typename
    }
  }
`;
export const createShare = /* GraphQL */ `
  mutation CreateShare(
    $input: CreateShareInput!
    $condition: ModelShareConditionInput
  ) {
    createShare(input: $input, condition: $condition) {
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
export const updateShare = /* GraphQL */ `
  mutation UpdateShare(
    $input: UpdateShareInput!
    $condition: ModelShareConditionInput
  ) {
    updateShare(input: $input, condition: $condition) {
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
export const deleteShare = /* GraphQL */ `
  mutation DeleteShare(
    $input: DeleteShareInput!
    $condition: ModelShareConditionInput
  ) {
    deleteShare(input: $input, condition: $condition) {
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

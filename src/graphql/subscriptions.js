/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateDocument = /* GraphQL */ `
  subscription OnCreateDocument(
    $filter: ModelSubscriptionDocumentFilterInput
    $owner: String
  ) {
    onCreateDocument(filter: $filter, owner: $owner) {
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
export const onUpdateDocument = /* GraphQL */ `
  subscription OnUpdateDocument(
    $filter: ModelSubscriptionDocumentFilterInput
    $owner: String
  ) {
    onUpdateDocument(filter: $filter, owner: $owner) {
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
export const onDeleteDocument = /* GraphQL */ `
  subscription OnDeleteDocument(
    $filter: ModelSubscriptionDocumentFilterInput
    $owner: String
  ) {
    onDeleteDocument(filter: $filter, owner: $owner) {
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
export const onCreateShare = /* GraphQL */ `
  subscription OnCreateShare(
    $filter: ModelSubscriptionShareFilterInput
    $owner: String
    $userEmail: String
  ) {
    onCreateShare(filter: $filter, owner: $owner, userEmail: $userEmail) {
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
export const onUpdateShare = /* GraphQL */ `
  subscription OnUpdateShare(
    $filter: ModelSubscriptionShareFilterInput
    $owner: String
    $userEmail: String
  ) {
    onUpdateShare(filter: $filter, owner: $owner, userEmail: $userEmail) {
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
export const onDeleteShare = /* GraphQL */ `
  subscription OnDeleteShare(
    $filter: ModelSubscriptionShareFilterInput
    $owner: String
    $userEmail: String
  ) {
    onDeleteShare(filter: $filter, owner: $owner, userEmail: $userEmail) {
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

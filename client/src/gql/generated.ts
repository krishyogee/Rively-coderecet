import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
  UUID: { input: string; output: string; }
};

export type AddCheckInInput = {
  checkInDate: Scalars['String']['input'];
  currentValue: Scalars['Float']['input'];
  keyResultUID: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  statusID: Scalars['Int']['input'];
};

export type CheckIn = {
  __typename?: 'CheckIn';
  checkInDate: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  currentValue: Scalars['Float']['output'];
  keyResultUID: Scalars['String']['output'];
  notes: Maybe<Scalars['String']['output']>;
  progressPercentage: Scalars['Float']['output'];
  statusID: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
};

export type CreateKeyResultInput = {
  ProgressType: KeyResultProgressType;
  UnitType: KeyResultUnitType;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate: Scalars['String']['input'];
  metricType: Scalars['String']['input'];
  objectiveUID: Scalars['String']['input'];
  owner: Scalars['String']['input'];
  startValue: Scalars['Float']['input'];
  status: KeyResultStatusType;
  targetValue: Scalars['Float']['input'];
  title: Scalars['String']['input'];
  updateFrequency: Scalars['String']['input'];
};

export type CreateKeyResultInputWithObjective = {
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate: Scalars['String']['input'];
  metricType: KeyResultMetricType;
  owner?: InputMaybe<Scalars['String']['input']>;
  progressType?: InputMaybe<KeyResultProgressType>;
  startValue: Scalars['Float']['input'];
  status: KeyResultStatusType;
  targetValue: Scalars['Float']['input'];
  title: Scalars['String']['input'];
  unit?: InputMaybe<KeyResultUnitType>;
  updateFrequency: KeyResultUpdateFrequencyType;
};

export type CreateKeyResultResponse = {
  __typename?: 'CreateKeyResultResponse';
  createdAt: Scalars['String']['output'];
  currentValue: Maybe<Scalars['Float']['output']>;
  description: Maybe<Scalars['String']['output']>;
  dueDate: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  metricType: Scalars['String']['output'];
  objectiveUID: Scalars['String']['output'];
  owner: Scalars['String']['output'];
  progressType: KeyResultProgressType;
  startValue: Scalars['Float']['output'];
  status: KeyResultStatusType;
  targetValue: Scalars['Float']['output'];
  title: Scalars['String']['output'];
  unit: Maybe<KeyResultUnitType>;
  updateFrequency: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type CreateObjectiveInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  keyResults?: InputMaybe<Array<CreateKeyResultInputWithObjective>>;
  ownerUID?: InputMaybe<Scalars['String']['input']>;
  teamUID?: InputMaybe<Scalars['String']['input']>;
  timePeriod: Scalars['String']['input'];
  title: Scalars['String']['input'];
  workspaceUID: Scalars['String']['input'];
};

export type CreateObjectiveResponse = {
  __typename?: 'CreateObjectiveResponse';
  Description: Scalars['String']['output'];
  ObjectiveUID: Scalars['String']['output'];
  OwnerUID: Scalars['String']['output'];
  TeamUID: Scalars['String']['output'];
  TimePeriod: Scalars['String']['output'];
  Title: Scalars['String']['output'];
  WorkspaceUID: Scalars['String']['output'];
  color: Scalars['String']['output'];
};

export type CreateProductInWorkspaceResponse = {
  __typename?: 'CreateProductInWorkspaceResponse';
  CreatedAt: Maybe<Scalars['DateTime']['output']>;
  CreatedBy: Maybe<Scalars['Int']['output']>;
  CustomerUID: Maybe<Scalars['String']['output']>;
  Name: Maybe<Scalars['String']['output']>;
  ProductUID: Maybe<Scalars['String']['output']>;
  UpdatedAt: Maybe<Scalars['DateTime']['output']>;
  WorkspaceUID: Maybe<Scalars['String']['output']>;
};

export type CreateProductInput = {
  name: Scalars['String']['input'];
  workspaceUID: Scalars['String']['input'];
};

export type CreateTeamInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  productUID: Scalars['String']['input'];
};

export type CreateWorkspaceInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type CreateWorskpaceResponse = {
  __typename?: 'CreateWorskpaceResponse';
  CreatedAt: Maybe<Scalars['DateTime']['output']>;
  CreatedBy: Maybe<Scalars['Int']['output']>;
  Customer: Maybe<Scalars['String']['output']>;
  Description: Maybe<Scalars['String']['output']>;
  Id: Maybe<Scalars['Int']['output']>;
  Name: Maybe<Scalars['String']['output']>;
  UpdatedAt: Maybe<Scalars['DateTime']['output']>;
  WorkspaceUID: Maybe<Scalars['String']['output']>;
};

export type Customer = {
  __typename?: 'Customer';
  CustomerUID: Maybe<Scalars['UUID']['output']>;
  Domain: Maybe<Scalars['String']['output']>;
  Id: Maybe<Scalars['Int']['output']>;
  IsVerified: Maybe<Scalars['Boolean']['output']>;
  Name: Maybe<Scalars['String']['output']>;
  OnboardingCompletion: Maybe<Scalars['Boolean']['output']>;
};

export type DeleteCheckInInput = {
  keyResultUID: Scalars['String']['input'];
};

export type DeleteKeyResultInput = {
  id: Scalars['ID']['input'];
};

export type DeleteKeyResultResponse = {
  __typename?: 'DeleteKeyResultResponse';
  success: Scalars['Boolean']['output'];
};

export type DeleteObjectiveInput = {
  objectiveUID: Scalars['String']['input'];
};

export type DeleteObjectiveResponse = {
  __typename?: 'DeleteObjectiveResponse';
  success: Scalars['Boolean']['output'];
};

export type DeleteProductInput = {
  productUID: Scalars['String']['input'];
};

export type DeleteProductResponse = {
  __typename?: 'DeleteProductResponse';
  Success: Scalars['Boolean']['output'];
};

export type DeleteTeamInput = {
  teamUID: Scalars['String']['input'];
};

export type DeleteTeamResponse = {
  __typename?: 'DeleteTeamResponse';
  Success: Maybe<Scalars['Boolean']['output']>;
};

export type DeleteWorkspaceInput = {
  workspaceUID: Scalars['String']['input'];
};

export type DeleteWorkspaceResponse = {
  __typename?: 'DeleteWorkspaceResponse';
  Success: Maybe<Scalars['Boolean']['output']>;
};

export type GetCustomerResponse = {
  __typename?: 'GetCustomerResponse';
  CustomerUID: Maybe<Scalars['UUID']['output']>;
  Domain: Maybe<Scalars['String']['output']>;
  Id: Maybe<Scalars['Int']['output']>;
  IsVerified: Maybe<Scalars['Boolean']['output']>;
  Name: Maybe<Scalars['String']['output']>;
  OnboardingCompletion: Maybe<Scalars['Boolean']['output']>;
};

export type GetProductByProductUidInput = {
  productUID: Scalars['String']['input'];
};

export type GetProductsByCustomerResponse = {
  __typename?: 'GetProductsByCustomerResponse';
  Products: Maybe<Array<Maybe<Product>>>;
};

export type GetProductsByWorkspaceInput = {
  workspaceUID: Scalars['String']['input'];
};

export type GetProductsByWorkspaceResponse = {
  __typename?: 'GetProductsByWorkspaceResponse';
  Products: Maybe<Array<Maybe<Product>>>;
};

export type GetProductsWithTeamsInput = {
  workspaceUID: Scalars['String']['input'];
};

export type GetProductsWithTeamsResponse = {
  __typename?: 'GetProductsWithTeamsResponse';
  ProductsWithTeams: Maybe<Array<Maybe<ProductWithTeams>>>;
};

export type GetTeamByUidInput = {
  teamUID: Scalars['String']['input'];
};

export type GetTeamsByProductUidInput = {
  productUID: Scalars['String']['input'];
};

export type GetWorkspaceByUidInput = {
  workspaceUID: Scalars['String']['input'];
};

export type GetWorkspaceResponse = {
  __typename?: 'GetWorkspaceResponse';
  CreatedAt: Maybe<Scalars['DateTime']['output']>;
  CreatedBy: Maybe<Scalars['Int']['output']>;
  Customer: Maybe<Scalars['String']['output']>;
  Description: Maybe<Scalars['String']['output']>;
  Id: Maybe<Scalars['Int']['output']>;
  Name: Maybe<Scalars['String']['output']>;
  UpdatedAt: Maybe<Scalars['DateTime']['output']>;
  WorkspaceUID: Maybe<Scalars['String']['output']>;
};

export type GetWorkspacesOfCustomerResponse = {
  __typename?: 'GetWorkspacesOfCustomerResponse';
  CreatedAt: Maybe<Scalars['DateTime']['output']>;
  CreatedBy: Maybe<Scalars['Int']['output']>;
  Description: Maybe<Scalars['String']['output']>;
  Id: Maybe<Scalars['Int']['output']>;
  Name: Maybe<Scalars['String']['output']>;
  Products: Array<WorkspaceProduct>;
  UpdatedAt: Maybe<Scalars['DateTime']['output']>;
  WorkspaceUID: Maybe<Scalars['String']['output']>;
};

export type GetWorkspacesOfCustomerWithAllDetailsResponse = {
  __typename?: 'GetWorkspacesOfCustomerWithAllDetailsResponse';
  CreatedAt: Maybe<Scalars['DateTime']['output']>;
  CreatedBy: Maybe<Scalars['Int']['output']>;
  Description: Maybe<Scalars['String']['output']>;
  Id: Maybe<Scalars['Int']['output']>;
  Name: Maybe<Scalars['String']['output']>;
  ProductsWithTeams: Array<ProductWithTeams>;
  UpdatedAt: Maybe<Scalars['DateTime']['output']>;
  WorkspaceUID: Maybe<Scalars['String']['output']>;
};

export type InviteTeamMembersInput = {
  emails: Array<Scalars['String']['input']>;
  teamUID: Scalars['String']['input'];
  workspaceUID: Scalars['String']['input'];
};

export type InviteTeamMembersResponse = {
  __typename?: 'InviteTeamMembersResponse';
  success: Scalars['Boolean']['output'];
};

export type KeyResult = {
  __typename?: 'KeyResult';
  createdAt: Scalars['String']['output'];
  currentValue: Maybe<Scalars['Float']['output']>;
  description: Maybe<Scalars['String']['output']>;
  dueDate: Scalars['String']['output'];
  keyResultUID: Scalars['String']['output'];
  metricTypeID: Maybe<Scalars['Int']['output']>;
  objectiveUID: Scalars['String']['output'];
  ownerUID: Scalars['String']['output'];
  progressType: Maybe<KeyResultProgressType>;
  startValue: Maybe<Scalars['Float']['output']>;
  statusID: Maybe<Scalars['Int']['output']>;
  targetValue: Maybe<Scalars['Float']['output']>;
  title: Scalars['String']['output'];
  unit: Maybe<KeyResultUnitType>;
  updateFrequencyID: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['String']['output'];
};

export type KeyResultMetricType =
  | 'BOOLEAN'
  | 'CURRENCY'
  | 'NUMBER'
  | 'PERCENTAGE';

export type KeyResultProgressType =
  | 'AGGREGATION'
  | 'MANUAL';

export type KeyResultStatusType =
  | 'AT_RISK'
  | 'BEHIND'
  | 'COMPLETED'
  | 'ON_TRACK';

export type KeyResultUnitType =
  | 'CURRENCY'
  | 'NUMBER'
  | 'PERCENTAGE';

export type KeyResultUpdateFrequencyType =
  | 'DAILY'
  | 'MONTHLY'
  | 'WEEKLY';

export type KeyResultWithCheckIns = {
  __typename?: 'KeyResultWithCheckIns';
  checkIns: Array<CheckIn>;
  keyResult: KeyResult;
};

export type Mutation = {
  __typename?: 'Mutation';
  _empty: Maybe<Scalars['String']['output']>;
  addCheckIn: CheckIn;
  createKeyResult: CreateKeyResultResponse;
  createObjective: CreateObjectiveResponse;
  createProduct: Product;
  createTeam: Team;
  createWorkspace: Workspace;
  deleteKeyResult: DeleteKeyResultResponse;
  deleteObjective: DeleteObjectiveResponse;
  deleteProduct: DeleteProductResponse;
  deleteTeam: DeleteTeamResponse;
  deleteWorkspace: DeleteWorkspaceResponse;
  inviteTeamMembers: InviteTeamMembersResponse;
  signup: SignupResponse;
  updateKeyResult: KeyResult;
  updateObjective: Objective;
  updateProduct: Product;
  updateTeam: Team;
  updateWorkspace: Workspace;
  verifyCustomer: VerifyCustomerResponse;
};


export type MutationAddCheckInArgs = {
  input: AddCheckInInput;
};


export type MutationCreateKeyResultArgs = {
  input: CreateKeyResultInput;
};


export type MutationCreateObjectiveArgs = {
  input: CreateObjectiveInput;
};


export type MutationCreateProductArgs = {
  input: CreateProductInput;
};


export type MutationCreateTeamArgs = {
  input: CreateTeamInput;
};


export type MutationCreateWorkspaceArgs = {
  input: CreateWorkspaceInput;
};


export type MutationDeleteKeyResultArgs = {
  input: DeleteKeyResultInput;
};


export type MutationDeleteObjectiveArgs = {
  input: DeleteObjectiveInput;
};


export type MutationDeleteProductArgs = {
  input: DeleteProductInput;
};


export type MutationDeleteTeamArgs = {
  input: DeleteTeamInput;
};


export type MutationDeleteWorkspaceArgs = {
  input: DeleteWorkspaceInput;
};


export type MutationInviteTeamMembersArgs = {
  input: InviteTeamMembersInput;
};


export type MutationSignupArgs = {
  input: SignupInput;
};


export type MutationUpdateKeyResultArgs = {
  input: UpdateKeyResultInput;
};


export type MutationUpdateObjectiveArgs = {
  input: UpdateObjectiveInput;
};


export type MutationUpdateProductArgs = {
  input: UpdateProductInput;
};


export type MutationUpdateTeamArgs = {
  input: UpdateTeamInput;
};


export type MutationUpdateWorkspaceArgs = {
  input: UpdateWorkspaceInput;
};


export type MutationVerifyCustomerArgs = {
  input: VerifyCustomerInput;
};

export type Objective = {
  __typename?: 'Objective';
  color: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  description: Maybe<Scalars['String']['output']>;
  keyResults: Maybe<Array<KeyResult>>;
  objectiveUID: Scalars['String']['output'];
  ownerUID: Scalars['String']['output'];
  teamUID: Maybe<Scalars['String']['output']>;
  timePeriod: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  workspaceUID: Maybe<Scalars['String']['output']>;
};

export type ObjectiveWithKeyResults = {
  __typename?: 'ObjectiveWithKeyResults';
  keyResults: Array<KeyResult>;
  objective: Objective;
};

export type Product = {
  __typename?: 'Product';
  CreatedAt: Maybe<Scalars['DateTime']['output']>;
  CreatedBy: Maybe<Scalars['String']['output']>;
  CustomerUID: Maybe<Scalars['String']['output']>;
  Name: Maybe<Scalars['String']['output']>;
  ProductUID: Maybe<Scalars['String']['output']>;
  UpdatedAt: Maybe<Scalars['DateTime']['output']>;
  WorkspaceUID: Maybe<Scalars['String']['output']>;
};

export type ProductWithTeams = {
  __typename?: 'ProductWithTeams';
  Product: Maybe<Product>;
  Teams: Maybe<Array<Maybe<Team>>>;
};

export type Query = {
  __typename?: 'Query';
  getAccountUsers: Array<User>;
  getCheckInsByKeyResult: Array<CheckIn>;
  getCustomer: GetCustomerResponse;
  getKeyResultByUID: Maybe<KeyResultWithCheckIns>;
  getKeyResultsByObjective: Array<ObjectiveWithKeyResults>;
  getObjectivesByTeam: Array<Objective>;
  getObjectivesByWorkspace: Array<Objective>;
  getProductByProductUID: Product;
  getProductsByWorkspace: GetProductsByWorkspaceResponse;
  getProductsWithTeams: GetProductsWithTeamsResponse;
  getTeamByUID: Team;
  getTeamInvitations: Array<TeamInvitations>;
  getTeamsByProductUID: Array<Team>;
  getWorkspaceByUID: Workspace;
  getWorkspacesOfCustomer: Array<GetWorkspacesOfCustomerResponse>;
  getWorkspacesOfCustomerWithAllDetails: Array<GetWorkspacesOfCustomerWithAllDetailsResponse>;
  /** @deprecated Default required query */
  ping: Maybe<Scalars['String']['output']>;
  signin: SigninReponse;
};


export type QueryGetCheckInsByKeyResultArgs = {
  keyResultUID: Scalars['String']['input'];
};


export type QueryGetKeyResultByUidArgs = {
  keyResultUID: Scalars['String']['input'];
};


export type QueryGetKeyResultsByObjectiveArgs = {
  objectiveUID: Scalars['String']['input'];
};


export type QueryGetObjectivesByTeamArgs = {
  teamUID: Scalars['String']['input'];
};


export type QueryGetObjectivesByWorkspaceArgs = {
  workspaceUID: Scalars['String']['input'];
};


export type QueryGetProductByProductUidArgs = {
  input: GetProductByProductUidInput;
};


export type QueryGetProductsByWorkspaceArgs = {
  input: GetProductsByWorkspaceInput;
};


export type QueryGetProductsWithTeamsArgs = {
  input: GetProductsWithTeamsInput;
};


export type QueryGetTeamByUidArgs = {
  input: GetTeamByUidInput;
};


export type QueryGetTeamInvitationsArgs = {
  team_uid: Scalars['String']['input'];
};


export type QueryGetTeamsByProductUidArgs = {
  input: GetTeamsByProductUidInput;
};


export type QueryGetWorkspaceByUidArgs = {
  input: GetWorkspaceByUidInput;
};


export type QuerySigninArgs = {
  input: SigninInput;
};

export type SigninInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type SigninReponse = {
  __typename?: 'SigninReponse';
  token: Scalars['String']['output'];
};

export type SignupInput = {
  companyName: Scalars['String']['input'];
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  userName: Scalars['String']['input'];
};

export type SignupResponse = {
  __typename?: 'SignupResponse';
  clerkId: Maybe<Scalars['String']['output']>;
  customerUID: Maybe<Scalars['String']['output']>;
  user: Maybe<User>;
  userId: Scalars['ID']['output'];
};

export type Team = {
  __typename?: 'Team';
  CreatedAt: Maybe<Scalars['DateTime']['output']>;
  CreatedBy: Maybe<Scalars['Int']['output']>;
  Description: Maybe<Scalars['String']['output']>;
  Name: Maybe<Scalars['String']['output']>;
  ProductUID: Maybe<Scalars['String']['output']>;
  TeamUID: Maybe<Scalars['String']['output']>;
  UpdatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type TeamInvitations = {
  __typename?: 'TeamInvitations';
  CreatedAt: Maybe<Scalars['DateTime']['output']>;
  Email: Maybe<Scalars['String']['output']>;
  ExpiresAt: Maybe<Scalars['DateTime']['output']>;
  Id: Maybe<Scalars['Int']['output']>;
  InvitedBy: Maybe<Scalars['Int']['output']>;
  Status: Maybe<Scalars['String']['output']>;
  TeamUID: Maybe<Scalars['String']['output']>;
  WorkspaceUID: Maybe<Scalars['String']['output']>;
};

export type UpdateCheckInInput = {
  blockers?: InputMaybe<Scalars['String']['input']>;
  confidenceLevel: Scalars['Int']['input'];
  currentValue: Scalars['Float']['input'];
  keyResultUID: Scalars['String']['input'];
  nextSteps?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  progressPercentage: Scalars['Float']['input'];
  status: Scalars['Int']['input'];
};

export type UpdateKeyResultInput = {
  currentValue?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  dueDate?: InputMaybe<Scalars['String']['input']>;
  keyResultUID: Scalars['String']['input'];
  metricType?: InputMaybe<KeyResultMetricType>;
  owner?: InputMaybe<Scalars['String']['input']>;
  startValue?: InputMaybe<Scalars['Float']['input']>;
  status?: InputMaybe<KeyResultStatusType>;
  targetValue?: InputMaybe<Scalars['Float']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  updateFrequency?: InputMaybe<KeyResultUpdateFrequencyType>;
};

export type UpdateObjectiveInput = {
  color?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  objectiveUID: Scalars['String']['input'];
  ownerUID?: InputMaybe<Scalars['String']['input']>;
  timePeriod: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export type UpdateProductInput = {
  name: Scalars['String']['input'];
  productUID: Scalars['String']['input'];
};

export type UpdateProductResponse = {
  __typename?: 'UpdateProductResponse';
  CreatedAt: Maybe<Scalars['DateTime']['output']>;
  CreatedBy: Maybe<Scalars['Int']['output']>;
  CustomerUID: Maybe<Scalars['String']['output']>;
  Name: Maybe<Scalars['String']['output']>;
  ProductUID: Maybe<Scalars['String']['output']>;
  UpdatedAt: Maybe<Scalars['DateTime']['output']>;
};

export type UpdateTeamInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  teamUID: Scalars['String']['input'];
};

export type UpdateWorkspaceInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  workspaceUID: Scalars['String']['input'];
};

export type User = {
  __typename?: 'User';
  clerkId: Maybe<Scalars['String']['output']>;
  customerUID: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isVerified: Maybe<Scalars['Boolean']['output']>;
  name: Maybe<Scalars['String']['output']>;
  userUID: Scalars['String']['output'];
};

export type VerifyCustomerInput = {
  token: Scalars['String']['input'];
};

export type VerifyCustomerResponse = {
  __typename?: 'VerifyCustomerResponse';
  OnboardingCompletion: Scalars['Boolean']['output'];
  success: Scalars['Boolean']['output'];
  token: Scalars['String']['output'];
};

export type Workspace = {
  __typename?: 'Workspace';
  CreatedAt: Maybe<Scalars['DateTime']['output']>;
  CreatedBy: Maybe<Scalars['Int']['output']>;
  Customer: Maybe<Scalars['String']['output']>;
  Description: Maybe<Scalars['String']['output']>;
  Id: Maybe<Scalars['Int']['output']>;
  Name: Maybe<Scalars['String']['output']>;
  UpdatedAt: Maybe<Scalars['DateTime']['output']>;
  WorkspaceUID: Maybe<Scalars['String']['output']>;
};

export type WorkspaceProduct = {
  __typename?: 'WorkspaceProduct';
  Name: Maybe<Scalars['String']['output']>;
  ProductUID: Maybe<Scalars['String']['output']>;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  AddCheckInInput: AddCheckInInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CheckIn: ResolverTypeWrapper<CheckIn>;
  CreateKeyResultInput: CreateKeyResultInput;
  CreateKeyResultInputWithObjective: CreateKeyResultInputWithObjective;
  CreateKeyResultResponse: ResolverTypeWrapper<CreateKeyResultResponse>;
  CreateObjectiveInput: CreateObjectiveInput;
  CreateObjectiveResponse: ResolverTypeWrapper<CreateObjectiveResponse>;
  CreateProductInWorkspaceResponse: ResolverTypeWrapper<CreateProductInWorkspaceResponse>;
  CreateProductInput: CreateProductInput;
  CreateTeamInput: CreateTeamInput;
  CreateWorkspaceInput: CreateWorkspaceInput;
  CreateWorskpaceResponse: ResolverTypeWrapper<CreateWorskpaceResponse>;
  Customer: ResolverTypeWrapper<Customer>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']['output']>;
  DeleteCheckInInput: DeleteCheckInInput;
  DeleteKeyResultInput: DeleteKeyResultInput;
  DeleteKeyResultResponse: ResolverTypeWrapper<DeleteKeyResultResponse>;
  DeleteObjectiveInput: DeleteObjectiveInput;
  DeleteObjectiveResponse: ResolverTypeWrapper<DeleteObjectiveResponse>;
  DeleteProductInput: DeleteProductInput;
  DeleteProductResponse: ResolverTypeWrapper<DeleteProductResponse>;
  DeleteTeamInput: DeleteTeamInput;
  DeleteTeamResponse: ResolverTypeWrapper<DeleteTeamResponse>;
  DeleteWorkspaceInput: DeleteWorkspaceInput;
  DeleteWorkspaceResponse: ResolverTypeWrapper<DeleteWorkspaceResponse>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  GetCustomerResponse: ResolverTypeWrapper<GetCustomerResponse>;
  GetProductByProductUIDInput: GetProductByProductUidInput;
  GetProductsByCustomerResponse: ResolverTypeWrapper<GetProductsByCustomerResponse>;
  GetProductsByWorkspaceInput: GetProductsByWorkspaceInput;
  GetProductsByWorkspaceResponse: ResolverTypeWrapper<GetProductsByWorkspaceResponse>;
  GetProductsWithTeamsInput: GetProductsWithTeamsInput;
  GetProductsWithTeamsResponse: ResolverTypeWrapper<GetProductsWithTeamsResponse>;
  GetTeamByUIDInput: GetTeamByUidInput;
  GetTeamsByProductUIDInput: GetTeamsByProductUidInput;
  GetWorkspaceByUIDInput: GetWorkspaceByUidInput;
  GetWorkspaceResponse: ResolverTypeWrapper<GetWorkspaceResponse>;
  GetWorkspacesOfCustomerResponse: ResolverTypeWrapper<GetWorkspacesOfCustomerResponse>;
  GetWorkspacesOfCustomerWithAllDetailsResponse: ResolverTypeWrapper<GetWorkspacesOfCustomerWithAllDetailsResponse>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  InviteTeamMembersInput: InviteTeamMembersInput;
  InviteTeamMembersResponse: ResolverTypeWrapper<InviteTeamMembersResponse>;
  KeyResult: ResolverTypeWrapper<KeyResult>;
  KeyResultMetricType: KeyResultMetricType;
  KeyResultProgressType: KeyResultProgressType;
  KeyResultStatusType: KeyResultStatusType;
  KeyResultUnitType: KeyResultUnitType;
  KeyResultUpdateFrequencyType: KeyResultUpdateFrequencyType;
  KeyResultWithCheckIns: ResolverTypeWrapper<KeyResultWithCheckIns>;
  Mutation: ResolverTypeWrapper<{}>;
  Objective: ResolverTypeWrapper<Objective>;
  ObjectiveWithKeyResults: ResolverTypeWrapper<ObjectiveWithKeyResults>;
  Product: ResolverTypeWrapper<Product>;
  ProductWithTeams: ResolverTypeWrapper<ProductWithTeams>;
  Query: ResolverTypeWrapper<{}>;
  SigninInput: SigninInput;
  SigninReponse: ResolverTypeWrapper<SigninReponse>;
  SignupInput: SignupInput;
  SignupResponse: ResolverTypeWrapper<SignupResponse>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Team: ResolverTypeWrapper<Team>;
  TeamInvitations: ResolverTypeWrapper<TeamInvitations>;
  UUID: ResolverTypeWrapper<Scalars['UUID']['output']>;
  UpdateCheckInInput: UpdateCheckInInput;
  UpdateKeyResultInput: UpdateKeyResultInput;
  UpdateObjectiveInput: UpdateObjectiveInput;
  UpdateProductInput: UpdateProductInput;
  UpdateProductResponse: ResolverTypeWrapper<UpdateProductResponse>;
  UpdateTeamInput: UpdateTeamInput;
  UpdateWorkspaceInput: UpdateWorkspaceInput;
  User: ResolverTypeWrapper<User>;
  VerifyCustomerInput: VerifyCustomerInput;
  VerifyCustomerResponse: ResolverTypeWrapper<VerifyCustomerResponse>;
  Workspace: ResolverTypeWrapper<Workspace>;
  WorkspaceProduct: ResolverTypeWrapper<WorkspaceProduct>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  AddCheckInInput: AddCheckInInput;
  Boolean: Scalars['Boolean']['output'];
  CheckIn: CheckIn;
  CreateKeyResultInput: CreateKeyResultInput;
  CreateKeyResultInputWithObjective: CreateKeyResultInputWithObjective;
  CreateKeyResultResponse: CreateKeyResultResponse;
  CreateObjectiveInput: CreateObjectiveInput;
  CreateObjectiveResponse: CreateObjectiveResponse;
  CreateProductInWorkspaceResponse: CreateProductInWorkspaceResponse;
  CreateProductInput: CreateProductInput;
  CreateTeamInput: CreateTeamInput;
  CreateWorkspaceInput: CreateWorkspaceInput;
  CreateWorskpaceResponse: CreateWorskpaceResponse;
  Customer: Customer;
  DateTime: Scalars['DateTime']['output'];
  DeleteCheckInInput: DeleteCheckInInput;
  DeleteKeyResultInput: DeleteKeyResultInput;
  DeleteKeyResultResponse: DeleteKeyResultResponse;
  DeleteObjectiveInput: DeleteObjectiveInput;
  DeleteObjectiveResponse: DeleteObjectiveResponse;
  DeleteProductInput: DeleteProductInput;
  DeleteProductResponse: DeleteProductResponse;
  DeleteTeamInput: DeleteTeamInput;
  DeleteTeamResponse: DeleteTeamResponse;
  DeleteWorkspaceInput: DeleteWorkspaceInput;
  DeleteWorkspaceResponse: DeleteWorkspaceResponse;
  Float: Scalars['Float']['output'];
  GetCustomerResponse: GetCustomerResponse;
  GetProductByProductUIDInput: GetProductByProductUidInput;
  GetProductsByCustomerResponse: GetProductsByCustomerResponse;
  GetProductsByWorkspaceInput: GetProductsByWorkspaceInput;
  GetProductsByWorkspaceResponse: GetProductsByWorkspaceResponse;
  GetProductsWithTeamsInput: GetProductsWithTeamsInput;
  GetProductsWithTeamsResponse: GetProductsWithTeamsResponse;
  GetTeamByUIDInput: GetTeamByUidInput;
  GetTeamsByProductUIDInput: GetTeamsByProductUidInput;
  GetWorkspaceByUIDInput: GetWorkspaceByUidInput;
  GetWorkspaceResponse: GetWorkspaceResponse;
  GetWorkspacesOfCustomerResponse: GetWorkspacesOfCustomerResponse;
  GetWorkspacesOfCustomerWithAllDetailsResponse: GetWorkspacesOfCustomerWithAllDetailsResponse;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  InviteTeamMembersInput: InviteTeamMembersInput;
  InviteTeamMembersResponse: InviteTeamMembersResponse;
  KeyResult: KeyResult;
  KeyResultWithCheckIns: KeyResultWithCheckIns;
  Mutation: {};
  Objective: Objective;
  ObjectiveWithKeyResults: ObjectiveWithKeyResults;
  Product: Product;
  ProductWithTeams: ProductWithTeams;
  Query: {};
  SigninInput: SigninInput;
  SigninReponse: SigninReponse;
  SignupInput: SignupInput;
  SignupResponse: SignupResponse;
  String: Scalars['String']['output'];
  Team: Team;
  TeamInvitations: TeamInvitations;
  UUID: Scalars['UUID']['output'];
  UpdateCheckInInput: UpdateCheckInInput;
  UpdateKeyResultInput: UpdateKeyResultInput;
  UpdateObjectiveInput: UpdateObjectiveInput;
  UpdateProductInput: UpdateProductInput;
  UpdateProductResponse: UpdateProductResponse;
  UpdateTeamInput: UpdateTeamInput;
  UpdateWorkspaceInput: UpdateWorkspaceInput;
  User: User;
  VerifyCustomerInput: VerifyCustomerInput;
  VerifyCustomerResponse: VerifyCustomerResponse;
  Workspace: Workspace;
  WorkspaceProduct: WorkspaceProduct;
}>;

export type CheckInResolvers<ContextType = any, ParentType extends ResolversParentTypes['CheckIn'] = ResolversParentTypes['CheckIn']> = ResolversObject<{
  checkInDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  currentValue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  keyResultUID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  progressPercentage?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  statusID?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CreateKeyResultResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateKeyResultResponse'] = ResolversParentTypes['CreateKeyResultResponse']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  currentValue?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dueDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  metricType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  objectiveUID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  owner?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  progressType?: Resolver<ResolversTypes['KeyResultProgressType'], ParentType, ContextType>;
  startValue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  status?: Resolver<ResolversTypes['KeyResultStatusType'], ParentType, ContextType>;
  targetValue?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  unit?: Resolver<Maybe<ResolversTypes['KeyResultUnitType']>, ParentType, ContextType>;
  updateFrequency?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CreateObjectiveResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateObjectiveResponse'] = ResolversParentTypes['CreateObjectiveResponse']> = ResolversObject<{
  Description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ObjectiveUID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  OwnerUID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  TeamUID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  TimePeriod?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  Title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  WorkspaceUID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CreateProductInWorkspaceResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateProductInWorkspaceResponse'] = ResolversParentTypes['CreateProductInWorkspaceResponse']> = ResolversObject<{
  CreatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  CreatedBy?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  CustomerUID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  Name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ProductUID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  UpdatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  WorkspaceUID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CreateWorskpaceResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['CreateWorskpaceResponse'] = ResolversParentTypes['CreateWorskpaceResponse']> = ResolversObject<{
  CreatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  CreatedBy?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  Customer?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  Description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  Id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  Name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  UpdatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  WorkspaceUID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type CustomerResolvers<ContextType = any, ParentType extends ResolversParentTypes['Customer'] = ResolversParentTypes['Customer']> = ResolversObject<{
  CustomerUID?: Resolver<Maybe<ResolversTypes['UUID']>, ParentType, ContextType>;
  Domain?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  Id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  IsVerified?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  Name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  OnboardingCompletion?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type DeleteKeyResultResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteKeyResultResponse'] = ResolversParentTypes['DeleteKeyResultResponse']> = ResolversObject<{
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DeleteObjectiveResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteObjectiveResponse'] = ResolversParentTypes['DeleteObjectiveResponse']> = ResolversObject<{
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DeleteProductResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteProductResponse'] = ResolversParentTypes['DeleteProductResponse']> = ResolversObject<{
  Success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DeleteTeamResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteTeamResponse'] = ResolversParentTypes['DeleteTeamResponse']> = ResolversObject<{
  Success?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type DeleteWorkspaceResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['DeleteWorkspaceResponse'] = ResolversParentTypes['DeleteWorkspaceResponse']> = ResolversObject<{
  Success?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GetCustomerResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['GetCustomerResponse'] = ResolversParentTypes['GetCustomerResponse']> = ResolversObject<{
  CustomerUID?: Resolver<Maybe<ResolversTypes['UUID']>, ParentType, ContextType>;
  Domain?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  Id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  IsVerified?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  Name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  OnboardingCompletion?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GetProductsByCustomerResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['GetProductsByCustomerResponse'] = ResolversParentTypes['GetProductsByCustomerResponse']> = ResolversObject<{
  Products?: Resolver<Maybe<Array<Maybe<ResolversTypes['Product']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GetProductsByWorkspaceResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['GetProductsByWorkspaceResponse'] = ResolversParentTypes['GetProductsByWorkspaceResponse']> = ResolversObject<{
  Products?: Resolver<Maybe<Array<Maybe<ResolversTypes['Product']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GetProductsWithTeamsResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['GetProductsWithTeamsResponse'] = ResolversParentTypes['GetProductsWithTeamsResponse']> = ResolversObject<{
  ProductsWithTeams?: Resolver<Maybe<Array<Maybe<ResolversTypes['ProductWithTeams']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GetWorkspaceResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['GetWorkspaceResponse'] = ResolversParentTypes['GetWorkspaceResponse']> = ResolversObject<{
  CreatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  CreatedBy?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  Customer?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  Description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  Id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  Name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  UpdatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  WorkspaceUID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GetWorkspacesOfCustomerResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['GetWorkspacesOfCustomerResponse'] = ResolversParentTypes['GetWorkspacesOfCustomerResponse']> = ResolversObject<{
  CreatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  CreatedBy?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  Description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  Id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  Name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  Products?: Resolver<Array<ResolversTypes['WorkspaceProduct']>, ParentType, ContextType>;
  UpdatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  WorkspaceUID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type GetWorkspacesOfCustomerWithAllDetailsResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['GetWorkspacesOfCustomerWithAllDetailsResponse'] = ResolversParentTypes['GetWorkspacesOfCustomerWithAllDetailsResponse']> = ResolversObject<{
  CreatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  CreatedBy?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  Description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  Id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  Name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ProductsWithTeams?: Resolver<Array<ResolversTypes['ProductWithTeams']>, ParentType, ContextType>;
  UpdatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  WorkspaceUID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type InviteTeamMembersResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['InviteTeamMembersResponse'] = ResolversParentTypes['InviteTeamMembersResponse']> = ResolversObject<{
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type KeyResultResolvers<ContextType = any, ParentType extends ResolversParentTypes['KeyResult'] = ResolversParentTypes['KeyResult']> = ResolversObject<{
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  currentValue?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  dueDate?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  keyResultUID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  metricTypeID?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  objectiveUID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ownerUID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  progressType?: Resolver<Maybe<ResolversTypes['KeyResultProgressType']>, ParentType, ContextType>;
  startValue?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  statusID?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  targetValue?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  unit?: Resolver<Maybe<ResolversTypes['KeyResultUnitType']>, ParentType, ContextType>;
  updateFrequencyID?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type KeyResultWithCheckInsResolvers<ContextType = any, ParentType extends ResolversParentTypes['KeyResultWithCheckIns'] = ResolversParentTypes['KeyResultWithCheckIns']> = ResolversObject<{
  checkIns?: Resolver<Array<ResolversTypes['CheckIn']>, ParentType, ContextType>;
  keyResult?: Resolver<ResolversTypes['KeyResult'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = ResolversObject<{
  _empty?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  addCheckIn?: Resolver<ResolversTypes['CheckIn'], ParentType, ContextType, RequireFields<MutationAddCheckInArgs, 'input'>>;
  createKeyResult?: Resolver<ResolversTypes['CreateKeyResultResponse'], ParentType, ContextType, RequireFields<MutationCreateKeyResultArgs, 'input'>>;
  createObjective?: Resolver<ResolversTypes['CreateObjectiveResponse'], ParentType, ContextType, RequireFields<MutationCreateObjectiveArgs, 'input'>>;
  createProduct?: Resolver<ResolversTypes['Product'], ParentType, ContextType, RequireFields<MutationCreateProductArgs, 'input'>>;
  createTeam?: Resolver<ResolversTypes['Team'], ParentType, ContextType, RequireFields<MutationCreateTeamArgs, 'input'>>;
  createWorkspace?: Resolver<ResolversTypes['Workspace'], ParentType, ContextType, RequireFields<MutationCreateWorkspaceArgs, 'input'>>;
  deleteKeyResult?: Resolver<ResolversTypes['DeleteKeyResultResponse'], ParentType, ContextType, RequireFields<MutationDeleteKeyResultArgs, 'input'>>;
  deleteObjective?: Resolver<ResolversTypes['DeleteObjectiveResponse'], ParentType, ContextType, RequireFields<MutationDeleteObjectiveArgs, 'input'>>;
  deleteProduct?: Resolver<ResolversTypes['DeleteProductResponse'], ParentType, ContextType, RequireFields<MutationDeleteProductArgs, 'input'>>;
  deleteTeam?: Resolver<ResolversTypes['DeleteTeamResponse'], ParentType, ContextType, RequireFields<MutationDeleteTeamArgs, 'input'>>;
  deleteWorkspace?: Resolver<ResolversTypes['DeleteWorkspaceResponse'], ParentType, ContextType, RequireFields<MutationDeleteWorkspaceArgs, 'input'>>;
  inviteTeamMembers?: Resolver<ResolversTypes['InviteTeamMembersResponse'], ParentType, ContextType, RequireFields<MutationInviteTeamMembersArgs, 'input'>>;
  signup?: Resolver<ResolversTypes['SignupResponse'], ParentType, ContextType, RequireFields<MutationSignupArgs, 'input'>>;
  updateKeyResult?: Resolver<ResolversTypes['KeyResult'], ParentType, ContextType, RequireFields<MutationUpdateKeyResultArgs, 'input'>>;
  updateObjective?: Resolver<ResolversTypes['Objective'], ParentType, ContextType, RequireFields<MutationUpdateObjectiveArgs, 'input'>>;
  updateProduct?: Resolver<ResolversTypes['Product'], ParentType, ContextType, RequireFields<MutationUpdateProductArgs, 'input'>>;
  updateTeam?: Resolver<ResolversTypes['Team'], ParentType, ContextType, RequireFields<MutationUpdateTeamArgs, 'input'>>;
  updateWorkspace?: Resolver<ResolversTypes['Workspace'], ParentType, ContextType, RequireFields<MutationUpdateWorkspaceArgs, 'input'>>;
  verifyCustomer?: Resolver<ResolversTypes['VerifyCustomerResponse'], ParentType, ContextType, RequireFields<MutationVerifyCustomerArgs, 'input'>>;
}>;

export type ObjectiveResolvers<ContextType = any, ParentType extends ResolversParentTypes['Objective'] = ResolversParentTypes['Objective']> = ResolversObject<{
  color?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  keyResults?: Resolver<Maybe<Array<ResolversTypes['KeyResult']>>, ParentType, ContextType>;
  objectiveUID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  ownerUID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  teamUID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  timePeriod?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  workspaceUID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ObjectiveWithKeyResultsResolvers<ContextType = any, ParentType extends ResolversParentTypes['ObjectiveWithKeyResults'] = ResolversParentTypes['ObjectiveWithKeyResults']> = ResolversObject<{
  keyResults?: Resolver<Array<ResolversTypes['KeyResult']>, ParentType, ContextType>;
  objective?: Resolver<ResolversTypes['Objective'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProductResolvers<ContextType = any, ParentType extends ResolversParentTypes['Product'] = ResolversParentTypes['Product']> = ResolversObject<{
  CreatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  CreatedBy?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  CustomerUID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  Name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ProductUID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  UpdatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  WorkspaceUID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProductWithTeamsResolvers<ContextType = any, ParentType extends ResolversParentTypes['ProductWithTeams'] = ResolversParentTypes['ProductWithTeams']> = ResolversObject<{
  Product?: Resolver<Maybe<ResolversTypes['Product']>, ParentType, ContextType>;
  Teams?: Resolver<Maybe<Array<Maybe<ResolversTypes['Team']>>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  getAccountUsers?: Resolver<Array<ResolversTypes['User']>, ParentType, ContextType>;
  getCheckInsByKeyResult?: Resolver<Array<ResolversTypes['CheckIn']>, ParentType, ContextType, RequireFields<QueryGetCheckInsByKeyResultArgs, 'keyResultUID'>>;
  getCustomer?: Resolver<ResolversTypes['GetCustomerResponse'], ParentType, ContextType>;
  getKeyResultByUID?: Resolver<Maybe<ResolversTypes['KeyResultWithCheckIns']>, ParentType, ContextType, RequireFields<QueryGetKeyResultByUidArgs, 'keyResultUID'>>;
  getKeyResultsByObjective?: Resolver<Array<ResolversTypes['ObjectiveWithKeyResults']>, ParentType, ContextType, RequireFields<QueryGetKeyResultsByObjectiveArgs, 'objectiveUID'>>;
  getObjectivesByTeam?: Resolver<Array<ResolversTypes['Objective']>, ParentType, ContextType, RequireFields<QueryGetObjectivesByTeamArgs, 'teamUID'>>;
  getObjectivesByWorkspace?: Resolver<Array<ResolversTypes['Objective']>, ParentType, ContextType, RequireFields<QueryGetObjectivesByWorkspaceArgs, 'workspaceUID'>>;
  getProductByProductUID?: Resolver<ResolversTypes['Product'], ParentType, ContextType, RequireFields<QueryGetProductByProductUidArgs, 'input'>>;
  getProductsByWorkspace?: Resolver<ResolversTypes['GetProductsByWorkspaceResponse'], ParentType, ContextType, RequireFields<QueryGetProductsByWorkspaceArgs, 'input'>>;
  getProductsWithTeams?: Resolver<ResolversTypes['GetProductsWithTeamsResponse'], ParentType, ContextType, RequireFields<QueryGetProductsWithTeamsArgs, 'input'>>;
  getTeamByUID?: Resolver<ResolversTypes['Team'], ParentType, ContextType, RequireFields<QueryGetTeamByUidArgs, 'input'>>;
  getTeamInvitations?: Resolver<Array<ResolversTypes['TeamInvitations']>, ParentType, ContextType, RequireFields<QueryGetTeamInvitationsArgs, 'team_uid'>>;
  getTeamsByProductUID?: Resolver<Array<ResolversTypes['Team']>, ParentType, ContextType, RequireFields<QueryGetTeamsByProductUidArgs, 'input'>>;
  getWorkspaceByUID?: Resolver<ResolversTypes['Workspace'], ParentType, ContextType, RequireFields<QueryGetWorkspaceByUidArgs, 'input'>>;
  getWorkspacesOfCustomer?: Resolver<Array<ResolversTypes['GetWorkspacesOfCustomerResponse']>, ParentType, ContextType>;
  getWorkspacesOfCustomerWithAllDetails?: Resolver<Array<ResolversTypes['GetWorkspacesOfCustomerWithAllDetailsResponse']>, ParentType, ContextType>;
  ping?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  signin?: Resolver<ResolversTypes['SigninReponse'], ParentType, ContextType, RequireFields<QuerySigninArgs, 'input'>>;
}>;

export type SigninReponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['SigninReponse'] = ResolversParentTypes['SigninReponse']> = ResolversObject<{
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SignupResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['SignupResponse'] = ResolversParentTypes['SignupResponse']> = ResolversObject<{
  clerkId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customerUID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  userId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TeamResolvers<ContextType = any, ParentType extends ResolversParentTypes['Team'] = ResolversParentTypes['Team']> = ResolversObject<{
  CreatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  CreatedBy?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  Description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  Name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ProductUID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  TeamUID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  UpdatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TeamInvitationsResolvers<ContextType = any, ParentType extends ResolversParentTypes['TeamInvitations'] = ResolversParentTypes['TeamInvitations']> = ResolversObject<{
  CreatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  Email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ExpiresAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  Id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  InvitedBy?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  Status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  TeamUID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  WorkspaceUID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface UuidScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['UUID'], any> {
  name: 'UUID';
}

export type UpdateProductResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['UpdateProductResponse'] = ResolversParentTypes['UpdateProductResponse']> = ResolversObject<{
  CreatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  CreatedBy?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  CustomerUID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  Name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ProductUID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  UpdatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = ResolversObject<{
  clerkId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  customerUID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isVerified?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  userUID?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VerifyCustomerResponseResolvers<ContextType = any, ParentType extends ResolversParentTypes['VerifyCustomerResponse'] = ResolversParentTypes['VerifyCustomerResponse']> = ResolversObject<{
  OnboardingCompletion?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  success?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WorkspaceResolvers<ContextType = any, ParentType extends ResolversParentTypes['Workspace'] = ResolversParentTypes['Workspace']> = ResolversObject<{
  CreatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  CreatedBy?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  Customer?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  Description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  Id?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  Name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  UpdatedAt?: Resolver<Maybe<ResolversTypes['DateTime']>, ParentType, ContextType>;
  WorkspaceUID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WorkspaceProductResolvers<ContextType = any, ParentType extends ResolversParentTypes['WorkspaceProduct'] = ResolversParentTypes['WorkspaceProduct']> = ResolversObject<{
  Name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  ProductUID?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = any> = ResolversObject<{
  CheckIn?: CheckInResolvers<ContextType>;
  CreateKeyResultResponse?: CreateKeyResultResponseResolvers<ContextType>;
  CreateObjectiveResponse?: CreateObjectiveResponseResolvers<ContextType>;
  CreateProductInWorkspaceResponse?: CreateProductInWorkspaceResponseResolvers<ContextType>;
  CreateWorskpaceResponse?: CreateWorskpaceResponseResolvers<ContextType>;
  Customer?: CustomerResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  DeleteKeyResultResponse?: DeleteKeyResultResponseResolvers<ContextType>;
  DeleteObjectiveResponse?: DeleteObjectiveResponseResolvers<ContextType>;
  DeleteProductResponse?: DeleteProductResponseResolvers<ContextType>;
  DeleteTeamResponse?: DeleteTeamResponseResolvers<ContextType>;
  DeleteWorkspaceResponse?: DeleteWorkspaceResponseResolvers<ContextType>;
  GetCustomerResponse?: GetCustomerResponseResolvers<ContextType>;
  GetProductsByCustomerResponse?: GetProductsByCustomerResponseResolvers<ContextType>;
  GetProductsByWorkspaceResponse?: GetProductsByWorkspaceResponseResolvers<ContextType>;
  GetProductsWithTeamsResponse?: GetProductsWithTeamsResponseResolvers<ContextType>;
  GetWorkspaceResponse?: GetWorkspaceResponseResolvers<ContextType>;
  GetWorkspacesOfCustomerResponse?: GetWorkspacesOfCustomerResponseResolvers<ContextType>;
  GetWorkspacesOfCustomerWithAllDetailsResponse?: GetWorkspacesOfCustomerWithAllDetailsResponseResolvers<ContextType>;
  InviteTeamMembersResponse?: InviteTeamMembersResponseResolvers<ContextType>;
  KeyResult?: KeyResultResolvers<ContextType>;
  KeyResultWithCheckIns?: KeyResultWithCheckInsResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Objective?: ObjectiveResolvers<ContextType>;
  ObjectiveWithKeyResults?: ObjectiveWithKeyResultsResolvers<ContextType>;
  Product?: ProductResolvers<ContextType>;
  ProductWithTeams?: ProductWithTeamsResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  SigninReponse?: SigninReponseResolvers<ContextType>;
  SignupResponse?: SignupResponseResolvers<ContextType>;
  Team?: TeamResolvers<ContextType>;
  TeamInvitations?: TeamInvitationsResolvers<ContextType>;
  UUID?: GraphQLScalarType;
  UpdateProductResponse?: UpdateProductResponseResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  VerifyCustomerResponse?: VerifyCustomerResponseResolvers<ContextType>;
  Workspace?: WorkspaceResolvers<ContextType>;
  WorkspaceProduct?: WorkspaceProductResolvers<ContextType>;
}>;


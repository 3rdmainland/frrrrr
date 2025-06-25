export interface IBaseResponse<T> {
    status: "success";
    data: T;
};

export type IReponse<T extends string, K> = {
    [key in T]: K;
};

// Single & List Entity Reponse
export interface IEntityResponse<T extends string, K> extends IBaseResponse<IReponse<T, K>> {};
export interface IEntityListResponse<T extends string, K> extends IEntityResponse<T, Array<K>> {};

// Paged Entity Response
export type TPagedListResponse<T extends string, K> = IReponse<T, K> & {
    totalPages: number;
    totalElements: number;
    pageNumber: number;
};
export interface IPagedEntityListResponse<T extends string, K> extends IBaseResponse<TPagedListResponse<T, Array<K>>> {};
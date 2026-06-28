import type { NavigatorScreenParams } from '@react-navigation/native'

export type UsersStackParamList = {
  UsersList: undefined
  UserDetail: { id: string; user?: import('@/types/users').UserListItemDto }
  RegisterUser: undefined
}

export type TenantsStackParamList = {
  TenantsList: undefined
  TenantCreate: undefined
  TenantEdit: { id: string }
}

export type DrawerParamList = {
  Dashboard: undefined
  Profile: undefined
  UsersStack: NavigatorScreenParams<UsersStackParamList>
  TenantsStack: NavigatorScreenParams<TenantsStackParamList>
}

export type RootStackParamList = {
  Login: undefined
  Main: NavigatorScreenParams<DrawerParamList>
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

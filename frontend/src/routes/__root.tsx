// src/routes/__root.tsx
import * as React from 'react'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { NotFoundPage } from '../components/NotFoundPage'

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundPage,
})

function RootComponent() {
  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  )
}
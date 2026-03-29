import React from 'react'
import { capitalize, upperFirst } from 'lodash-es'

export function UserCard({ name, role }) {
  return (
    <div className="user-card">
      <div className="avatar">{name.charAt(0).toUpperCase()}</div>
      <div>
        <h3>{upperFirst(name)}</h3>
        <p>{capitalize(role)}</p>
      </div>
    </div>
  )
}

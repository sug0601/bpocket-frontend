
export interface User {
  id: string
  uid: string
  name: string
  profile: string
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  createdAt: Date
}

export interface Building {
  id: string
  name: string
  description: string | null
  url: string
  lat: string
  lon: string
  categoryId: string
  architect: string
  thumbnail: string
  createdAt: Date
}

export interface Post {
  id: string
  buildingId: string | null
  status: string
  createdAt: Date
}

export interface Comment {
  id: string
  content: string
  postId: string
  authorId: string
  createdAt: Date
  updatedAt: Date
}
import type { User, Category, Building, Post, Comment } from "./types"

export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@example.com",
    password: "admin123",
    name: "管理者",
    role: "admin",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    email: "user@example.com",
    password: "user123",
    name: "一般ユーザー",
    role: "user",
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
  },
]

export const mockCategories: Category[] = [
  {
    id: "1",
    name: "お知らせ",
    description: "重要なお知らせを投稿するカテゴリ",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "イベント",
    description: "イベント情報を投稿するカテゴリ",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
]

export const mockBuildings: Building[] = [
  {
    id: "1",
    name: "本社ビル",
    address: "東京都渋谷区1-2-3",
    description: "メインオフィス",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "第二ビル",
    address: "東京都新宿区4-5-6",
    description: "サブオフィス",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
]

export const mockPosts: Post[] = [
  {
    id: "1",
    title: "新年のご挨拶",
    content: "明けましておめでとうございます。本年もよろしくお願いいたします。",
    authorId: "1",
    categoryId: "1",
    buildingId: "1",
    published: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    title: "新年会のお知らせ",
    content: "1月15日に新年会を開催します。",
    authorId: "1",
    categoryId: "2",
    buildingId: "1",
    published: true,
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05"),
  },
]

export const mockComments: Comment[] = [
  {
    id: "1",
    content: "よろしくお願いします！",
    postId: "1",
    authorId: "2",
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
  },
  {
    id: "2",
    content: "参加します！",
    postId: "2",
    authorId: "2",
    createdAt: new Date("2024-01-06"),
    updatedAt: new Date("2024-01-06"),
  },
]

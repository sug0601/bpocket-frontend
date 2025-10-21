"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Search, Pencil, Trash2, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import type { Post, Building, Category, User } from "@/lib/types"
import { fetcher } from "@/helpers/fetch"
import PostFormDialog from "./form"
import { Badge } from "@/components/ui/badge"

export type PostFormData = {
  buildingId: string
  status: string
}

export type Response = {
  result: {
    items: {
      post: Post
      building: Building
      category: Category
      user: User
    }[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export default function PostsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | null>(null)

  // SWRで投稿と建物を取得
  const { data, error, mutate } = useSWR<Response>(
    `/post?page=${currentPage}&pageSize=10`,
    fetcher
  )

  if (error) return <p className="text-red-500">データの取得に失敗しました</p>
  if (!data) return <p>読み込み中...</p>

  const posts = data.result.items
  const totalPages = data.result.totalPages

  const filteredPosts = posts.filter(({ building }) =>
    building.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 新規追加 or 編集ダイアログを開く
  const openFormDialog = (post?: Post) => {
    setEditingPost(post ?? null)
    setIsDialogOpen(true)
  }

  // 共通フォームの送信処理
  const handleSubmit = async (formData: PostFormData) => {
    try {
      if (editingPost) {
        await fetch(`http://localhost:3000/post/${editingPost.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      } else {
        await fetch("http://localhost:3000/post", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
      }
      setIsDialogOpen(false)
      setEditingPost(null)
      mutate()
    } catch (err) {
      console.error(err)
      alert("保存に失敗しました")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("この投稿を削除してもよろしいですか？")) return
    try {
      await fetch(`http://localhost:3000/post/${id}`, { method: "DELETE" })
      mutate()
    } catch (err) {
      console.error(err)
      alert("削除に失敗しました")
    }
  }

  return (
    <div className="space-y-6">
      {/* ヘッダーと追加ボタン */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">投稿管理</h1>
          <p className="text-muted-foreground mt-2">投稿の管理</p>
        </div>

        <Button onClick={() => openFormDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          新規追加
        </Button>
      </div>

      {/* 投稿一覧 */}
      <Card>
        <CardHeader>
          <CardTitle>投稿一覧</CardTitle>
          <CardDescription>登録されている投稿の一覧</CardDescription>
        </CardHeader>
        <CardContent>
          {/* 検索 */}
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="建物名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* テーブル */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>カテゴリ</TableHead>
                  <TableHead>建物</TableHead>
                  <TableHead>状態</TableHead>
                  <TableHead>投稿者</TableHead>
                  <TableHead>作成日</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      投稿が見つかりません
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPosts.map(({ post, building, category, user }) => (
                    <TableRow key={post.id}>
                      <TableCell><Badge>{category.name}</Badge></TableCell>
                      <TableCell>{building.name}</TableCell>
                      <TableCell>{post.status}</TableCell>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{new Date(post.createdAt).toLocaleDateString("ja-JP")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openFormDialog(post)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                {data.result.total}件中 ページ {currentPage} / {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  前へ
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  次へ
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 新規/編集共通ダイアログ */}
      <PostFormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingPost ? {
          buildingId: editingPost.buildingId ?? undefined,
          status: editingPost.status as "confirming" | "approved",
        } : undefined}
        title={editingPost ? "投稿編集" : "新規投稿追加"}
      />
    </div>
  )
}

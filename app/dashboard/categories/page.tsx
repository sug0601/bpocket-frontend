"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2, Search } from "lucide-react"
import type { Category } from "@/lib/types"
import { fetcher } from "@/helpers/fetch"
import CategoryFormDialog from "./form"

export type CategoryFormData = {
  name: string
}

export default function CategoriesPage() {
  const { data, error } = useSWR<{ result: Category[] }>("/category", fetcher)
  const categories: Category[] = data?.result || []

  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSubmit = async (data: CategoryFormData) => {
    if (!data.name.trim()) return alert("カテゴリ名は必須です")

    try {
      if (editingCategory) {
        // 編集
        await fetch(`http://localhost:3000/category/${editingCategory.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
      } else {
        // 追加
        await fetch("http://localhost:3000/category", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
      }

      setIsDialogOpen(false)
      setEditingCategory(null)
      mutate("/category")
    } catch (err) {
      console.error(err)
      alert("保存に失敗しました")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("このカテゴリを削除してもよろしいですか？")) return
    await fetch("http://localhost:3000/category", { method: "DELETE", body: JSON.stringify({ categoryId: id }) })
    mutate("/category")
  }

  const openEditDialog = (category: Category) => {
    setEditingCategory(category)
    setIsDialogOpen(true)
  }

  if (error) return <div>読み込みエラー</div>
  if (!data) return <div>読み込み中...</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">カテゴリ管理</h1>
          <p className="text-muted-foreground mt-2">投稿カテゴリの管理</p>
        </div>

        <Button onClick={() => { setEditingCategory(null); setIsDialogOpen(true) }}>
          <Plus className="mr-2 h-4 w-4" /> 新規追加
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>カテゴリ一覧</CardTitle>
          <CardDescription>登録されているカテゴリの一覧</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="カテゴリ名で検索..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>カテゴリ名</TableHead>
                  <TableHead>作成日</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      カテゴリが見つかりません
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map(category => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{new Date(category.createdAt).toLocaleDateString("ja-JP")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(category)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
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
        </CardContent>
      </Card>

      {/* 共通フォームダイアログ */}
      <CategoryFormDialog
        key={editingCategory?.name}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmit}
        initialData={editingCategory ? { name: editingCategory.name } : undefined}
        title={editingCategory ? "カテゴリ編集" : "新規カテゴリ追加"}
      />
    </div>
  )
}

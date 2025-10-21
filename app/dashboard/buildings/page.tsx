"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react"
import type { Building, Category } from "@/lib/types"
import { fetcher } from "@/helpers/fetch"
import BuildingFormDialog from "./form"

type Response = {
  result: {
    items: Building[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

export type BuildingFormData = {
  name: string
  url: string
  lat: string
  lon: string
  categoryId: string
  architect: string
  description: string
  thumbnail: string
}

export default function BuildingsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { data: categories } = useSWR<{ result: Category[] }>("/category", fetcher)
  const { data: buildingResponse, mutate } = useSWR<Response>(`/building?page=${currentPage}&pageSize=${itemsPerPage}`, fetcher)

  const buildings = buildingResponse?.result.items || []
  const totalPages = buildingResponse?.result.totalPages || 1
  const totalItems = buildingResponse?.result.total || 0

  const filteredBuildings = buildings.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null)

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
    })
  }

  // --- 追加 ---
  const handleAdd = async (data: BuildingFormData, file: File | null) => {
    if (!data.name.trim()) return alert("ビル名は必須です")
    try {
      let base64Thumbnail = data.thumbnail
      let thumbnailFileName = ""
      let thumbnailMimeType = ""

      if (file) {
        base64Thumbnail = await fileToBase64(file)
        thumbnailFileName = file.name
        thumbnailMimeType = file.type
      }

      const res = await fetch("http://localhost:3000/building", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          thumbnail: base64Thumbnail,
          thumbnailFileName,
          thumbnailMimeType
        }),
      })
      if (!res.ok) throw new Error("追加に失敗しました")
      mutate()
      setIsAddDialogOpen(false)
    } catch (err) {
      alert("追加に失敗しました")
      console.error(err)
    }
  }

  // --- 編集 ---
  const handleEdit = async (data: BuildingFormData, file: File | null) => {
    if (!editingBuilding) return
    try {
      let base64Thumbnail = data.thumbnail
      let thumbnailFileName = ""
      let thumbnailMimeType = ""

      if (file) {
        base64Thumbnail = await fileToBase64(file)
        thumbnailFileName = file.name
        thumbnailMimeType = file.type
      }

      const res = await fetch(`http://localhost:3000/building/${editingBuilding.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          thumbnail: base64Thumbnail,
          thumbnailFileName,
          thumbnailMimeType
        }),
      })
      if (!res.ok) throw new Error("更新に失敗しました")
      mutate()
      setIsEditDialogOpen(false)
      setEditingBuilding(null)
    } catch (err) {
      alert("更新に失敗しました")
      console.error(err)
    }
  }

  // --- 削除 ---
  const handleDelete = async (id: string) => {
    if (!confirm("このビルを削除してもよろしいですか？")) return
    try {
      const res = await fetch(`http://localhost:3000/building/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("削除に失敗しました")
      mutate()
    } catch (err) {
      alert("削除に失敗しました")
      console.error(err)
    }
  }

  // --- 編集ダイアログを開く ---
  const openEditDialog = (building: Building) => {
    setEditingBuilding(building)
    setIsEditDialogOpen(true)
  }

  // --- Building を BuildingFormData に変換 ---
  const mapBuildingToFormData = (b: Building): BuildingFormData => ({
    name: b.name ?? "",
    url: b.url ?? "",
    lat: b.lat ?? "",
    lon: b.lon ?? "",
    categoryId: b.categoryId ?? "",
    architect: b.architect ?? "",
    description: b.description ?? "",
    thumbnail: b.thumbnail ?? "",
  })

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">ビル管理</h1>
          <p className="text-muted-foreground mt-2">建物情報の管理</p>
        </div>

        {/* 新規追加ボタン */}
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> 新規追加
        </Button>

        {/* 新規追加ダイアログ */}
        <BuildingFormDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          onSubmit={handleAdd}
          categories={categories?.result || []}
          title="新規ビル追加"
        />
      </div>

      {/* 一覧テーブル */}
      <Card>
        <CardHeader>
          <CardTitle>ビル一覧</CardTitle>
          <CardDescription>登録されているビルの一覧</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="ビル名で検索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ビル名</TableHead>
                  <TableHead>住所</TableHead>
                  <TableHead>説明</TableHead>
                  <TableHead>画像</TableHead>
                  <TableHead>作成日</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBuildings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      ビルが見つかりません
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBuildings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell>{b.architect}</TableCell>
                      <TableCell className="max-w-xs truncate">{b.description || "-"}</TableCell>
                      <TableCell>
                        {b.thumbnail ? (
                          <a href={b.thumbnail} target="_blank" rel="noopener noreferrer">
                            <img src={b.thumbnail} alt={b.name} className="h-12 w-12 object-cover rounded-md border" />
                          </a>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>{b.createdAt ? new Date(b.createdAt).toLocaleDateString("ja-JP") : "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(b)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}>
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
                {totalItems}件中 {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)}件を表示
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" /> 前へ
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(page)} className="min-w-[2.5rem]">
                      {page}
                    </Button>
                  ))}
                </div>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  次へ <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 編集ダイアログ */}
      {editingBuilding && (
        <BuildingFormDialog
          key={editingBuilding.id}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleEdit}
          initialData={mapBuildingToFormData(editingBuilding)}
          categories={categories?.result || []}
          title="ビル編集"
        />
      )}
    </div>
  )
}

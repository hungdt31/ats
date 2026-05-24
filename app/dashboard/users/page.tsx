"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMe } from "@/hooks/use-me";
import {
  useDashboardUsers,
  useUpdateDashboardUser,
  useCreateDashboardUser,
} from "@/hooks/use-dashboard-users";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01FreeIcons } from "@hugeicons/core-free-icons";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin", badgeVariant: "destructive" as const },
  { value: "hr", label: "HR", badgeVariant: "default" as const },
  { value: "interviewer", label: "Interviewer", badgeVariant: "secondary" as const },
  { value: "candidate", label: "Candidate", badgeVariant: "outline" as const },
];

export default function UserManagementPage() {
  const router = useRouter();
  const { data: currentUser, isLoading: isUserLoading } = useMe();
  const { data: users, isLoading: isUsersLoading } = useDashboardUsers();
  const updateMutation = useUpdateDashboardUser();
  const createMutation = useCreateDashboardUser();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newFullName, setNewFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState("candidate");

  // States for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState("5");

  // Reset page when search or filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newFullName.trim() || !newEmail.trim() || !newPassword.trim() || !newRole) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải dài tối thiểu 6 ký tự.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        fullName: newFullName.trim(),
        email: newEmail.trim(),
        password: newPassword,
        phone: newPhone.trim() || undefined,
        role: newRole,
      });

      toast.success("Tạo tài khoản người dùng mới thành công!");
      setIsCreateOpen(false);
      // Reset form
      setNewFullName("");
      setNewEmail("");
      setNewPassword("");
      setNewPhone("");
      setNewRole("candidate");
    } catch (err: any) {
      toast.error(err.message || "Không thể tạo tài khoản mới.");
    }
  };

  // Bảo vệ route: Chỉ cho phép admin truy cập
  React.useEffect(() => {
    if (!isUserLoading) {
      if (!currentUser || currentUser.role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [currentUser, isUserLoading, router]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateMutation.mutateAsync({ id: userId, role: newRole });
      toast.success("Cập nhật vai trò người dùng thành công!");
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi cập nhật vai trò.");
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    try {
      await updateMutation.mutateAsync({ id: userId, isActive: !currentStatus });
      toast.success(
        !currentStatus ? "Đã kích hoạt tài khoản thành công!" : "Đã vô hiệu hóa tài khoản thành công!"
      );
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi cập nhật trạng thái hoạt động.");
    }
  };

  // Filter users based on search term and role filter
  const filteredUsers = React.useMemo(() => {
    if (!users) return [];
    return users.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const pageSizeNumber = parseInt(pageSize, 10);
  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / pageSizeNumber);

  const paginatedUsers = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSizeNumber;
    return filteredUsers.slice(startIndex, startIndex + pageSizeNumber);
  }, [filteredUsers, currentPage, pageSizeNumber]);

  if (isUserLoading || !currentUser || currentUser.role !== "admin") {
    return (
      <div className="flex flex-col gap-6 max-w-6xl mx-auto py-12 text-center text-muted-foreground">
        Đang xác thực quyền truy cập...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Quản lý người dùng</h1>
          <p className="text-sm text-muted-foreground">
            Xem danh sách, phân quyền vai trò và bật/tắt kích hoạt tài khoản của các thành viên.
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-10 px-4 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all cursor-pointer">
              <HugeiconsIcon icon={Add01FreeIcons} className="size-4" /> Tạo người dùng
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl border-border/80 bg-background">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Tạo người dùng mới</DialogTitle>
              <DialogDescription className="text-xs">
                Tạo tài khoản mới với mật khẩu được mã hóa an toàn. Mặc định tài khoản sẽ ở trạng thái kích hoạt.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 py-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Họ và tên <span className="text-destructive">*</span></label>
                <Input
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="rounded-xl h-10 px-3 text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Email <span className="text-destructive">*</span></label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="rounded-xl h-10 px-3 text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Mật khẩu <span className="text-destructive">*</span></label>
                <Input
                  type="password"
                  placeholder="Tối thiểu 6 ký tự"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-xl h-10 px-3 text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Số điện thoại</label>
                <Input
                  placeholder="Ví dụ: 0987654321"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="rounded-xl h-10 px-3 text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Vai trò <span className="text-destructive">*</span></label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className="rounded-xl h-10 bg-background text-sm">
                    <SelectValue placeholder="Chọn vai trò" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border bg-background">
                    {ROLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="rounded-lg text-sm">
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter className="gap-3 sm:gap-2 pt-2 border-t border-border/30">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  disabled={createMutation.isPending}
                  className="rounded-xl h-10 text-xs"
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="rounded-xl h-10 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  {createMutation.isPending ? "Đang xử lý..." : "Lưu người dùng"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            <div className="flex-1 max-w-md">
              <Input
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-2xl h-10 px-3"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Lọc theo vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="rounded-lg">Tất cả vai trò</SelectItem>
                  <SelectItem value="admin" className="rounded-lg">Admin</SelectItem>
                  <SelectItem value="hr" className="rounded-lg">HR</SelectItem>
                  <SelectItem value="interviewer" className="rounded-lg">Interviewer</SelectItem>
                  <SelectItem value="candidate" className="rounded-lg">Candidate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isUsersLoading ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Đang tải danh sách người dùng...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              Không tìm thấy người dùng phù hợp.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto px-6">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="w-[300px]">Người dùng</TableHead>
                      <TableHead>Số điện thoại</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead className="text-center">Kích hoạt</TableHead>
                      <TableHead>Ngày tham gia</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => {
                      const isSelf = user.id === currentUser.id;
                      const roleConfig = ROLE_OPTIONS.find((o) => o.value === user.role) || ROLE_OPTIONS[3];

                      return (
                        <TableRow key={user.id} className="hover:bg-muted/10">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar size="default">
                                {user.avatarUrl ? (
                                  <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                                ) : (
                                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                    {user.fullName.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-semibold text-foreground text-sm flex items-center gap-1.5">
                                  {user.fullName}
                                  {isSelf && (
                                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-normal uppercase">
                                      ME
                                    </Badge>
                                  )}
                                </span>
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm font-medium text-foreground">
                            {user.phone || "—"}
                          </TableCell>
                          <TableCell>
                            {isSelf ? (
                              <Badge variant={roleConfig.badgeVariant} className="font-semibold uppercase text-[10px]">
                                {roleConfig.label}
                              </Badge>
                            ) : (
                              <div className="w-36">
                                <Select
                                  value={user.role}
                                  onValueChange={(val) => handleRoleChange(user.id, val)}
                                  disabled={updateMutation.isPending}
                                >
                                  <SelectTrigger className="rounded-xl h-8 text-xs bg-background border-input/60">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-xl border-border bg-background text-xs">
                                    {ROLE_OPTIONS.map((opt) => (
                                      <SelectItem key={opt.value} value={opt.value} className="rounded-lg text-xs">
                                        {opt.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => handleToggleActive(user.id, user.isActive)}
                                disabled={isSelf || updateMutation.isPending}
                                className={cn(
                                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                                  user.isActive ? "bg-primary" : "bg-muted-foreground/30"
                                )}
                                title={isSelf ? "Bạn không thể tự vô hiệu hóa tài khoản của chính mình" : ""}
                              >
                                <span
                                  className={cn(
                                    "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-sm ring-0 transition duration-200 ease-in-out",
                                    user.isActive ? "translate-x-5" : "translate-x-0"
                                  )}
                                />
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-medium">
                            {new Date(user.createdAt).toLocaleDateString("vi-VN", {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                            })}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {totalItems > 0 && (
                <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 border-t border-border/30">
                  <div className="flex w-full justify-between items-center gap-4 text-xs text-muted-foreground font-medium">
                    <span>
                      Hiển thị {Math.min((currentPage - 1) * pageSizeNumber + 1, totalItems)} -{" "}
                      {Math.min(currentPage * pageSizeNumber, totalItems)} trong số {totalItems} người dùng
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span>Số dòng:</span>
                      <Select value={pageSize} onValueChange={setPageSize}>
                        <SelectTrigger className="rounded-lg h-7 w-[60px] bg-background text-xs border-input/60">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border bg-background text-xs">
                          <SelectItem value="5" className="rounded-lg text-xs">5</SelectItem>
                          <SelectItem value="10" className="rounded-lg text-xs">10</SelectItem>
                          <SelectItem value="20" className="rounded-lg text-xs">20</SelectItem>
                          <SelectItem value="50" className="rounded-lg text-xs">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {totalPages > 1 && (
                    <Pagination className="w-auto mx-0">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage > 1) setCurrentPage(currentPage - 1);
                            }}
                            className={cn(
                              "cursor-pointer text-xs h-8 px-2.5 rounded-xl border border-input/60 bg-background hover:bg-muted transition-all select-none",
                              currentPage === 1 && "pointer-events-none opacity-50"
                            )}
                            text="Trước"
                            href="#"
                          />
                        </PaginationItem>

                        {(() => {
                          const items = [];
                          for (let i = 1; i <= totalPages; i++) {
                            items.push(
                              <PaginationItem key={i}>
                                <PaginationLink
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setCurrentPage(i);
                                  }}
                                  isActive={currentPage === i}
                                  className={cn(
                                    "cursor-pointer text-xs size-8 rounded-xl select-none font-semibold",
                                    currentPage === i
                                      ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                                      : "border border-input/60 bg-background hover:bg-muted text-foreground transition-all"
                                  )}
                                  href="#"
                                >
                                  {i}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                          return items;
                        })()}

                        <PaginationItem>
                          <PaginationNext
                            onClick={(e) => {
                              e.preventDefault();
                              if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                            }}
                            className={cn(
                              "cursor-pointer text-xs h-8 px-2.5 rounded-xl border border-input/60 bg-background hover:bg-muted transition-all select-none",
                              currentPage === totalPages && "pointer-events-none opacity-50"
                            )}
                            text="Sau"
                            href="#"
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </CardFooter>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

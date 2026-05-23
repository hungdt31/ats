"use client";

import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { useMe, useUpdateProfile, useUploadAvatar } from "@/hooks/use-me";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

export default function ProfilePage() {
  const { data: currentUser, isLoading } = useMe();
  const updateMutation = useUpdateProfile();
  const { uploadAvatar, isUploading } = useUploadAvatar();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar(file);
    }
  };

  // Profile Info Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Password Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Pre-fill form when user data is loaded
  React.useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || "");
      setEmail(currentUser.email || "");
      setPhone(currentUser.phone || "");
    }
  }, [currentUser]);

  const hasChanges = React.useMemo(() => {
    if (!currentUser) return false;
    return (
      fullName !== (currentUser.fullName || "") ||
      email !== (currentUser.email || "") ||
      phone !== (currentUser.phone || "")
    );
  }, [currentUser, fullName, email, phone]);

  const handleReset = () => {
    if (currentUser) {
      setFullName(currentUser.fullName || "");
      setEmail(currentUser.email || "");
      setPhone(currentUser.phone || "");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Họ và tên không được để trống.");
      return;
    }
    if (!email.trim()) {
      toast.error("Email không được để trống.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      toast.success("Cập nhật thông tin cá nhân thành công!");
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi cập nhật thông tin.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      toast.error("Mật khẩu mới phải dài tối thiểu 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không trùng khớp.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      toast.success("Thay đổi mật khẩu thành công!");
      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi thay đổi mật khẩu.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto py-12 text-center text-muted-foreground">
        Đang tải thông tin tài khoản...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto py-12 text-center text-destructive">
        Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Hồ sơ cá nhân</h1>
        <p className="text-sm text-muted-foreground">
          Quản lý thông tin tài khoản và cập nhật mật khẩu của bạn.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card: Profile Info */}
        <Card className="border-border/80 bg-background shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Thông tin tài khoản</CardTitle>
            <CardDescription className="text-xs">
              Cập nhật thông tin liên hệ và ảnh đại diện của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex items-center gap-4 py-2 border-b border-border/30 mb-2">
                <div className="relative group cursor-pointer size-16 rounded-full overflow-hidden border-2 border-primary/20">
                  <Avatar className="!size-full">
                    {currentUser.avatarUrl ? (
                      <AvatarImage src={currentUser.avatarUrl} alt={fullName} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                        {fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  {/* Hover Overlay */}
                  <label htmlFor="avatar-upload" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
                  </label>

                  {isUploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Spinner className="size-5 text-primary" />
                    </div>
                  )}
                </div>

                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={isUploading}
                />

                <div className="flex flex-col">
                  <span className="font-semibold text-foreground text-sm">{fullName || "—"}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="w-fit scale-90 origin-left text-[9px] font-semibold uppercase">
                      {currentUser.role}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Họ và tên <span className="text-destructive">*</span></label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-xl h-10 px-3 text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Email <span className="text-destructive">*</span></label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl h-10 px-3 text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Số điện thoại</label>
                <Input
                  placeholder="Ví dụ: 0987654321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-xl h-10 px-3 text-sm"
                />
              </div>



              <div className="flex justify-end gap-3 pt-2">
                {hasChanges && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={updateMutation.isPending}
                    className="rounded-xl h-10 text-xs px-5"
                  >
                    Hủy
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={updateMutation.isPending || !hasChanges}
                  className="rounded-xl h-10 text-xs font-semibold px-5"
                >
                  {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Card: Change Password */}
        <Card className="border-border/80 bg-background shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Đổi mật khẩu</CardTitle>
            <CardDescription className="text-xs">
              Thiết lập mật khẩu mới để tăng cường bảo mật cho tài khoản.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Mật khẩu hiện tại <span className="text-destructive">*</span></label>
                <Input
                  type="password"
                  placeholder="Nhập mật khẩu hiện tại"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="rounded-xl h-10 px-3 text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-foreground">Mật khẩu mới <span className="text-destructive">*</span></label>
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
                <label className="text-xs font-semibold text-foreground">Xác nhận mật khẩu mới <span className="text-destructive">*</span></label>
                <Input
                  type="password"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-xl h-10 px-3 text-sm"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="rounded-xl h-10 text-xs font-semibold px-5"
                >
                  {updateMutation.isPending ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

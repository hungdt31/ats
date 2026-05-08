"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Field, FieldLabel } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Folder01Icon,
  File01Icon,
  Upload01Icon,
  PencilEdit01Icon,
  Delete02Icon,
  Mail01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";
import { useSendOtp, useVerifyEmail } from "@/hooks/use-auth";
import { ApiError } from "@/lib/api-client";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import type { CandidateProfileData, useUpdateCandidateProfile } from "@/hooks/use-candidate";
import { useCandidateFiles } from "@/hooks/use-candidate-files";
import { useChangePassword } from "@/hooks/use-change-password";

type Msg = { type: "success" | "error"; text: string };

type Props = {
  profileData: CandidateProfileData | undefined;
  isLoading: boolean;
  updateProfileMutation: ReturnType<typeof useUpdateCandidateProfile>;
};

export function CandidateProfile({ profileData, isLoading, updateProfileMutation }: Props) {
  // ── Profile edit ──────────────────────────────────────────────────────────
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [yearsExperience, setYearsExperience] = useState(0);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  // ── Password change ───────────────────────────────────────────────────────
  const {
    currentPassword,
    newPassword,
    confirmPassword,
    isPending: isPwdPending,
    msg: pwdMsg,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    handleSubmit: handleChangePassword,
  } = useChangePassword();

  // ── Email verification ────────────────────────────────────────────────────
  const sendOtpMutation = useSendOtp();
  const verifyEmailMutation = useVerifyEmail();
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpMsg, setOtpMsg] = useState<Msg | null>(null);
  const [otpCooldown, setOtpCooldown] = useState(0);

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const id = setTimeout(() => setOtpCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [otpCooldown]);

  async function handleSendOtp() {
    if (!profileData?.email) return;
    setOtpMsg(null);
    try {
      await sendOtpMutation.mutateAsync({ email: profileData.email, type: "email_verify" });
      setOtpSent(true);
      setOtpCooldown(60);
      setOtpMsg({ type: "success", text: "Mã OTP đã được gửi đến email của bạn" });
    } catch (err) {
      setOtpMsg({
        type: "error",
        text: err instanceof ApiError ? err.message : "Gửi mã thất bại, vui lòng thử lại",
      });
    }
  }

  async function handleVerifyEmail() {
    if (!profileData?.email || otpCode.length < 6) return;
    setOtpMsg(null);
    try {
      await verifyEmailMutation.mutateAsync({ email: profileData.email, code: otpCode });
      setOtpMsg({ type: "success", text: "Xác minh email thành công!" });
      setOtpSent(false);
      setOtpCode("");
      window.location.reload();
    } catch (err) {
      setOtpMsg({
        type: "error",
        text: err instanceof ApiError ? err.message : "Xác minh thất bại, vui lòng thử lại",
      });
    }
  }

  // ── File management ───────────────────────────────────────────────────────
  const {
    files,
    isLoading: isFilesLoading,
    isUploading: isFilesUploading,
    msg: fileMsg,
    editingFile,
    editFileName,
    setEditingFile,
    setEditFileName,
    uploadFile,
    renameFile,
    deleteFile,
  } = useCandidateFiles();

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleEditInit() {
    if (profileData) {
      setFullName(profileData.fullName ?? "");
      setEmail(profileData.email ?? "");
      setPhone(profileData.phone ?? "");
      setTitle(profileData.profile?.title ?? "");
      setBio(profileData.profile?.bio ?? "");
      setLocation(profileData.profile?.location ?? "");
      setYearsExperience(profileData.profile?.years_experience ?? 0);
      setLinkedinUrl(profileData.profile?.linkedin_url ?? "");
      setGithubUrl(profileData.profile?.github_url ?? "");
    }
    setIsEditMode(true);
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync({
        fullName,
        email,
        phone: phone || null,
        title: title || null,
        bio: bio || null,
        location: location || null,
        years_experience: Number(yearsExperience) || 0,
        linkedin_url: linkedinUrl || null,
        github_url: githubUrl || null,
      });
      setIsEditMode(false);
    } catch (err) {
      console.error(err);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return <p className="animate-pulse py-6 text-muted-foreground">Đang tải hồ sơ cá nhân...</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* ── Cột chính ──────────────────────────────────────────────────────── */}
      <div className="lg:col-span-2">
        {!isEditMode ? (
          <Card className="h-full border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold">
                  {profileData?.fullName ?? "Chưa cập nhật"}
                </CardTitle>
                <span className="font-medium text-foreground">
                  {profileData?.profile?.title ?? "—"}
                </span>
              </div>
              <Button variant="outline" onClick={handleEditInit}>
                Chỉnh sửa hồ sơ
              </Button>
            </CardHeader>

            <CardContent className="space-y-4 pt-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-muted-foreground">Điện thoại</span>
                  <span className="font-medium text-foreground">{profileData?.phone ?? "—"}</span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">Email</span>
                  <span className="font-medium text-foreground">{profileData?.email ?? "—"}</span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">Kinh nghiệm</span>
                  <span className="font-medium text-foreground">
                    {profileData?.profile?.years_experience ?? 0} năm
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">Địa điểm</span>
                  <span className="font-medium text-foreground">
                    {profileData?.profile?.location ?? "—"}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <span className="mb-1 block text-xs text-muted-foreground">
                  Giới thiệu bản thân (Bio)
                </span>
                <p className="whitespace-pre-wrap leading-relaxed text-foreground">
                  {profileData?.profile?.bio ?? "Chưa có thông tin giới thiệu."}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-xs text-muted-foreground">LinkedIn</span>
                  {profileData?.profile?.linkedin_url ? (
                    <a
                      href={profileData.profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-primary hover:underline"
                    >
                      {profileData.profile.linkedin_url}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">GitHub</span>
                  {profileData?.profile?.github_url ? (
                    <a
                      href={profileData.profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-primary hover:underline"
                    >
                      {profileData.profile.github_url}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
              </div>

              <Separator />

              {/* Quản lý file cá nhân */}
              <div className="space-y-4 pt-2">
                <div>
                  <span className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <HugeiconsIcon icon={Folder01Icon} className="size-4 text-primary" />
                    Quản lý tệp cá nhân
                  </span>
                  <span className="mt-0.5 block text-xs text-muted-foreground">
                    Upload CV, Portfolio hay chứng chỉ của bạn.
                  </span>
                </div>

                {fileMsg && <MsgBox msg={fileMsg} />}

                {/* Upload mới */}
                <div className="space-y-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <HugeiconsIcon icon={Upload01Icon} className="size-3.5 text-muted-foreground" />
                    Thêm tệp tin mới
                  </span>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    disabled={isFilesUploading}
                    onChange={async (e) => {
                      const fileObj = e.target.files?.[0];
                      if (!fileObj) return;
                      await uploadFile(fileObj);
                      e.target.value = "";
                    }}
                  />
                  {isFilesUploading && (
                    <p className="animate-pulse text-xs text-muted-foreground">Đang tải tệp lên...</p>
                  )}
                </div>

                <Separator />

                {/* Danh sách file */}
                <div className="space-y-3">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    Tệp tin đã tải lên
                  </span>
                  {isFilesLoading ? (
                    <p className="animate-pulse text-xs text-muted-foreground">Đang tải danh sách tệp...</p>
                  ) : files.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Bạn chưa tải lên tệp tin nào.</p>
                  ) : (
                    <div className="max-h-64 space-y-2 overflow-y-auto">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="flex flex-col gap-1 rounded-xl border border-secondary p-2 text-xs shadow-sm"
                        >
                          <div className="flex items-center justify-between gap-2">
                            {editingFile?.id === file.id ? (
                              <Input
                                value={editFileName}
                                onChange={(e) => setEditFileName(e.target.value)}
                                className="h-7 px-2 text-xs"
                              />
                            ) : (
                              <div className="flex min-w-0 items-center gap-1.5">
                                <HugeiconsIcon
                                  icon={File01Icon}
                                  className="size-3.5 flex-shrink-0 text-muted-foreground"
                                />
                                <a
                                  href={file.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="truncate font-medium hover:underline"
                                >
                                  {file.file_name}
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="mt-1 flex items-center justify-end gap-2">
                            {editingFile?.id === file.id ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => setEditingFile(null)}
                                >
                                  Hủy
                                </Button>
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => renameFile(file.id, editFileName)}
                                >
                                  Lưu
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex h-6 items-center gap-1 px-2 text-xs"
                                  onClick={() => {
                                    setEditingFile(file);
                                    setEditFileName(file.file_name);
                                  }}
                                >
                                  <HugeiconsIcon
                                    icon={PencilEdit01Icon}
                                    className="size-3 text-muted-foreground"
                                  />
                                  Sửa tên
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="flex h-6 items-center gap-1 px-2 text-xs text-destructive hover:text-destructive"
                                  onClick={() => deleteFile(file.id)}
                                >
                                  <HugeiconsIcon icon={Delete02Icon} className="size-3 text-destructive" />
                                  Xóa
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* ── Form chỉnh sửa ──────────────────────────────────────────────── */
          <Card className="border-border/80">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Chỉnh sửa hồ sơ</CardTitle>
              <CardDescription>Cập nhật thông tin cá nhân của bạn.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field className="space-y-1.5">
                    <FieldLabel className="text-xs font-medium">Họ và tên</FieldLabel>
                    <Input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </Field>
                  <Field className="space-y-1.5">
                    <FieldLabel className="text-xs font-medium">Email</FieldLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field className="space-y-1.5">
                    <FieldLabel className="text-xs font-medium">Điện thoại</FieldLabel>
                    <Input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </Field>
                  <Field className="space-y-1.5">
                    <FieldLabel className="text-xs font-medium">Tiêu đề (Vị trí công việc)</FieldLabel>
                    <Input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Software Engineer, Frontend Developer, ..."
                    />
                  </Field>
                  <Field className="space-y-1.5">
                    <FieldLabel className="text-xs font-medium">Kinh nghiệm (năm)</FieldLabel>
                    <Input
                      type="number"
                      min={0}
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(Number(e.target.value))}
                    />
                  </Field>
                  <Field className="space-y-1.5">
                    <FieldLabel className="text-xs font-medium">Địa điểm</FieldLabel>
                    <Input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Hà Nội, TP. Hồ Chí Minh, ..."
                    />
                  </Field>
                </div>

                <Field className="space-y-1.5">
                  <FieldLabel className="text-xs font-medium">Giới thiệu bản thân (Bio)</FieldLabel>
                  <Textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field className="space-y-1.5">
                    <FieldLabel className="text-xs font-medium">LinkedIn URL</FieldLabel>
                    <Input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                    />
                  </Field>
                  <Field className="space-y-1.5">
                    <FieldLabel className="text-xs font-medium">GitHub URL</FieldLabel>
                    <Input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/..."
                    />
                  </Field>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" type="button" onClick={() => setIsEditMode(false)}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={updateProfileMutation.isPending}>
                    {updateProfileMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Cột phải ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-6 lg:col-span-1">
        {/* Card đổi mật khẩu */}
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Đổi mật khẩu</CardTitle>
            <CardDescription>Đổi mật khẩu tài khoản của bạn.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {pwdMsg && <MsgBox msg={pwdMsg} />}

              <Field className="space-y-1.5">
                <FieldLabel className="text-xs font-medium">Mật khẩu hiện tại</FieldLabel>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </Field>

              <Field className="space-y-1.5">
                <FieldLabel className="text-xs font-medium">Mật khẩu mới</FieldLabel>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </Field>

              <Field className="space-y-1.5">
                <FieldLabel className="text-xs font-medium">Xác nhận mật khẩu mới</FieldLabel>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Field>

              <Button type="submit" className="w-full" disabled={isPwdPending}>
                {isPwdPending ? "Đang lưu..." : "Đổi mật khẩu"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Card xác minh email */}
        <Card className="border-border/80">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-xl font-bold">
                <HugeiconsIcon icon={Mail01Icon} className="size-5 text-primary" />
                Xác minh email
              </CardTitle>
              {profileData?.emailVerified ? (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
                >
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3.5" />
                  Đã xác minh
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="border-amber-500/20 bg-amber-500/10 text-amber-600"
                >
                  Chưa xác minh
                </Badge>
              )}
            </div>
            <CardDescription>
              {profileData?.emailVerified
                ? "Địa chỉ email của bạn đã được xác minh."
                : "Xác minh email để bảo vệ tài khoản của bạn."}
            </CardDescription>
          </CardHeader>

          {!profileData?.emailVerified && (
            <CardContent className="space-y-4">
              {otpMsg && <MsgBox msg={otpMsg} />}

              <p className="text-xs text-muted-foreground">
                Mã OTP sẽ được gửi đến{" "}
                <span className="font-medium text-foreground">{profileData?.email}</span>
              </p>

              {!otpSent ? (
                <Button className="w-full" onClick={handleSendOtp} disabled={sendOtpMutation.isPending}>
                  {sendOtpMutation.isPending ? "Đang gửi…" : "Gửi mã OTP"}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-3">
                    <p className="self-start text-xs text-muted-foreground">Nhập mã 6 chữ số:</p>
                    <InputOTP
                      maxLength={6}
                      pattern={REGEXP_ONLY_DIGITS}
                      value={otpCode}
                      onChange={setOtpCode}
                      disabled={verifyEmailMutation.isPending}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleVerifyEmail}
                    disabled={verifyEmailMutation.isPending || otpCode.length < 6}
                  >
                    {verifyEmailMutation.isPending ? "Đang xác minh…" : "Xác minh email"}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    Không nhận được mã?{" "}
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpCooldown > 0 || sendOtpMutation.isPending}
                      className="font-medium text-primary underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {otpCooldown > 0 ? `Gửi lại sau ${otpCooldown}s` : "Gửi lại mã"}
                    </button>
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}

/** Component hiển thị thông báo success / error dùng chung. */
function MsgBox({ msg }: { msg: Msg }) {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-xs ${
        msg.type === "success"
          ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
          : "border-destructive/30 bg-destructive/5 text-destructive"
      }`}
    >
      {msg.text}
    </div>
  );
}

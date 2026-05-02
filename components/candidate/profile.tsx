"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Field, FieldLabel } from "@/components/ui/field";
import { storage, BUCKET_ID, ID } from "@/lib/appwrite";
import { HugeiconsIcon } from "@hugeicons/react";
import { Folder01Icon, File01Icon, Upload01Icon, PencilEdit01Icon, Delete02Icon } from "@hugeicons/core-free-icons";

type Props = {
  profileData: any;
  isLoading: boolean;
  updateProfileMutation: any;
};

export function CandidateProfile({ profileData, isLoading, updateProfileMutation }: Props) {
  // Profile form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [yearsExperience, setYearsExperience] = useState(0);
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPwdPending, setIsPwdPending] = useState(false);

  // File management state
  const [files, setFiles] = useState<any[]>([]);
  const [isFilesLoading, setIsFilesLoading] = useState(false);
  const [isFilesUploading, setIsFilesUploading] = useState(false);
  const [fileMsg, setFileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal / Edit state for files
  const [editingFile, setEditingFile] = useState<any | null>(null);
  const [editFileName, setEditFileName] = useState("");

  const fetchFiles = async () => {
    setIsFilesLoading(true);
    try {
      const res = await fetch("/api/candidate/files");
      const data = await res.json();
      if (res.ok && data.success) {
        setFiles(data.data.files);
      }
    } catch (err) {
      console.error("[Fetch files error]", err);
    } finally {
      setIsFilesLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleEditInit = () => {
    if (profileData) {
      setFullName(profileData.fullName || "");
      setPhone(profileData.phone || "");
      setTitle(profileData.profile?.title || "");
      setBio(profileData.profile?.bio || "");
      setLocation(profileData.profile?.location || "");
      setYearsExperience(profileData.profile?.years_experience || 0);
      setLinkedinUrl(profileData.profile?.linkedin_url || "");
      setGithubUrl(profileData.profile?.github_url || "");
    }
    setIsEditMode(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfileMutation.mutateAsync({
        fullName,
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
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: "error", text: "Xác nhận mật khẩu mới không khớp" });
      return;
    }

    setIsPwdPending(true);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwdMsg({ type: "error", text: data.message || "Không thể đổi mật khẩu" });
      } else {
        setPwdMsg({ type: "success", text: "Đổi mật khẩu thành công!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setPwdMsg({ type: "error", text: "Lỗi kết nối máy chủ khi đổi mật khẩu" });
    } finally {
      setIsPwdPending(false);
    }
  };

  if (isLoading) {
    return <p className="text-muted-foreground py-6 animate-pulse">Đang tải hồ sơ cá nhân...</p>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {!isEditMode ? (
          <Card className="border-border/80 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold">
                  {profileData?.fullName || "Chưa cập nhật"}
                </CardTitle>
                <CardDescription>{profileData?.email}</CardDescription>
              </div>
              <Button variant="outline" onClick={handleEditInit}>
                Chỉnh sửa hồ sơ
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 text-sm pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block text-xs">Điện thoại</span>
                  <span className="font-medium text-foreground">{profileData?.phone || "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Vị trí ứng tuyển</span>
                  <span className="font-medium text-foreground">
                    {profileData?.profile?.title || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Kinh nghiệm</span>
                  <span className="font-medium text-foreground">
                    {profileData?.profile?.years_experience || 0} năm
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">Địa điểm</span>
                  <span className="font-medium text-foreground">
                    {profileData?.profile?.location || "—"}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <span className="text-muted-foreground block text-xs mb-1">Giới thiệu bản thân (Bio)</span>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {profileData?.profile?.bio || "Chưa có thông tin giới thiệu."}
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-muted-foreground block text-xs">LinkedIn</span>
                  {profileData?.profile?.linkedin_url ? (
                    <a
                      href={profileData.profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
                    >
                      {profileData.profile.linkedin_url}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground block text-xs">GitHub</span>
                  {profileData?.profile?.github_url ? (
                    <a
                      href={profileData.profile.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all"
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
                  <span className="text-sm font-bold text-foreground flex items-center gap-2">
                    <HugeiconsIcon icon={Folder01Icon} className="size-4 text-primary" /> Quản lý tệp cá nhân
                  </span>
                  <span className="text-xs text-muted-foreground block mt-0.5">
                    Upload CV, Portfolio hay chứng chỉ của bạn.
                  </span>
                </div>

                {fileMsg && (
                  <div
                    className={`rounded-xl border px-4 py-3 text-xs ${fileMsg.type === "success"
                      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                      : "border-destructive/30 bg-destructive/5 text-destructive"
                      }`}
                  >
                    {fileMsg.text}
                  </div>
                )}

                {/* Upload file mới */}
                <div className="space-y-2">
                  <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <HugeiconsIcon icon={Upload01Icon} className="size-3.5 text-muted-foreground" /> Thêm tệp tin mới
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    disabled={isFilesUploading}
                    onChange={async (e) => {
                      const fileObj = e.target.files?.[0];
                      if (!fileObj) return;

                      const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
                      const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT;
                      if (!endpoint || !project || !BUCKET_ID) {
                        setFileMsg({ type: "error", text: "Cấu hình Appwrite chưa đầy đủ trong file .env" });
                        return;
                      }

                      setIsFilesUploading(true);
                      setFileMsg(null);
                      try {
                        // 1. Upload to Appwrite Storage
                        const fileResponse = await storage.createFile(BUCKET_ID, ID.unique(), fileObj);
                        const fileUrl = `${endpoint}/storage/buckets/${BUCKET_ID}/files/${fileResponse.$id}/view?project=${project}`;

                        // 2. Save to database
                        const res = await fetch("/api/candidate/files", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            file_name: fileObj.name,
                            file_url: fileUrl,
                            file_type: "cv",
                            appwrite_id: fileResponse.$id,
                          }),
                        });

                        if (!res.ok) {
                          const data = await res.json();
                          setFileMsg({ type: "error", text: data.message || "Không thể lưu tệp vào hệ thống" });
                        } else {
                          setFileMsg({ type: "success", text: "Tải tệp lên thành công" });
                          fetchFiles();
                        }
                      } catch (err: any) {
                        setFileMsg({ type: "error", text: err.message || "Lỗi khi tải tệp lên" });
                      } finally {
                        setIsFilesUploading(false);
                        e.target.value = "";
                      }
                    }}
                    className="flex w-full rounded-2xl border border-dashed border-border bg-input/20 px-4 py-3 text-sm transition-all focus:border-ring focus:outline-none file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-semibold file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
                  />
                  {isFilesUploading && <p className="text-xs text-muted-foreground animate-pulse">Đang tải tệp lên...</p>}
                </div>

                <Separator />

                {/* Danh sách các file */}
                <div className="space-y-3">
                  <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    Tệp tin đã tải lên
                  </span>
                  {isFilesLoading ? (
                    <p className="text-xs text-muted-foreground animate-pulse">Đang tải danh sách tệp...</p>
                  ) : files.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Bạn chưa tải lên tệp tin nào.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className="flex flex-col gap-1 p-2 rounded-xl border border-secondary shadow-sm text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            {editingFile?.id === file.id ? (
                              <input
                                type="text"
                                value={editFileName}
                                onChange={(e) => setEditFileName(e.target.value)}
                                className="flex h-7 w-full rounded-3xl border border-transparent bg-input/80 px-2 text-xs transition-all outline-none"
                              />
                            ) : (
                              <div className="flex items-center gap-1.5 min-w-0">
                                <HugeiconsIcon icon={File01Icon} className="size-3.5 text-muted-foreground flex-shrink-0" />
                                <a
                                  href={file.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium hover:underline truncate"
                                >
                                  {file.file_name}
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end items-center gap-2 mt-1">
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
                                  onClick={async () => {
                                    try {
                                      const res = await fetch(`/api/candidate/files/${file.id}`, {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ file_name: editFileName }),
                                      });
                                      if (res.ok) {
                                        setFileMsg({ type: "success", text: "Đổi tên tệp thành công" });
                                        setEditingFile(null);
                                        fetchFiles();
                                      }
                                    } catch (err) {
                                      setFileMsg({ type: "error", text: "Không thể đổi tên tệp" });
                                    }
                                  }}
                                >
                                  Lưu
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs flex items-center gap-1"
                                  onClick={() => {
                                    setEditingFile(file);
                                    setEditFileName(file.file_name);
                                  }}
                                >
                                  <HugeiconsIcon icon={PencilEdit01Icon} className="size-3 text-muted-foreground" /> Sửa tên
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs text-destructive hover:text-destructive flex items-center gap-1"
                                  onClick={async () => {
                                    try {
                                      const res = await fetch(`/api/candidate/files/${file.id}`, {
                                        method: "DELETE",
                                      });
                                      if (res.ok) {
                                        setFileMsg({ type: "success", text: "Xóa tệp thành công" });
                                        fetchFiles();
                                      }
                                    } catch (err) {
                                      setFileMsg({ type: "error", text: "Không thể xóa tệp" });
                                    }
                                  }}
                                >
                                  <HugeiconsIcon icon={Delete02Icon} className="size-3 text-destructive" /> Xóa
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
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="flex h-9 w-full rounded-3xl border border-transparent bg-input/50 px-4 py-2 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3"
                      required
                    />
                  </Field>
                  <Field className="space-y-1.5">
                    <FieldLabel className="text-xs font-medium">Điện thoại</FieldLabel>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex h-9 w-full rounded-3xl border border-transparent bg-input/50 px-4 py-2 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3"
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field className="space-y-1.5">
                    <FieldLabel className="text-xs font-medium">Tiêu đề (Vị trí công việc)</FieldLabel>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Software Engineer, Frontend Developer, ..."
                      className="flex h-9 w-full rounded-3xl border border-transparent bg-input/50 px-4 py-2 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3"
                    />
                  </Field>
                  <Field className="space-y-1.5">
                    <FieldLabel className="text-xs font-medium">Kinh nghiệm (năm)</FieldLabel>
                    <input
                      type="number"
                      min={0}
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(Number(e.target.value))}
                      className="flex h-9 w-full rounded-3xl border border-transparent bg-input/50 px-4 py-2 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3"
                    />
                  </Field>
                </div>

                <Field className="space-y-1.5">
                  <FieldLabel className="text-xs font-medium">Địa điểm</FieldLabel>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Hà Nội, TP. Hồ Chí Minh, ..."
                    className="flex h-9 w-full rounded-3xl border border-transparent bg-input/50 px-4 py-2 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3"
                  />
                </Field>

                <Field className="space-y-1.5">
                  <FieldLabel className="text-xs font-medium">Giới thiệu bản thân (Bio)</FieldLabel>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="flex w-full rounded-2xl border border-transparent bg-input/50 px-4 py-3 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3"
                  />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field className="space-y-1.5">
                    <FieldLabel className="text-xs font-medium">LinkedIn URL</FieldLabel>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="flex h-9 w-full rounded-3xl border border-transparent bg-input/50 px-4 py-2 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3"
                    />
                  </Field>
                  <Field className="space-y-1.5">
                    <FieldLabel className="text-xs font-medium">GitHub URL</FieldLabel>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className="flex h-9 w-full rounded-3xl border border-transparent bg-input/50 px-4 py-2 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3"
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

      <div className="lg:col-span-1">
        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Đổi mật khẩu</CardTitle>
            <CardDescription>Đổi mật khẩu tài khoản của bạn.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {pwdMsg && (
                <div
                  className={`rounded-xl border px-4 py-3 text-xs ${pwdMsg.type === "success"
                    ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
                    : "border-destructive/30 bg-destructive/5 text-destructive"
                    }`}
                >
                  {pwdMsg.text}
                </div>
              )}

              <Field className="space-y-1.5">
                <FieldLabel className="text-xs font-medium">Mật khẩu hiện tại</FieldLabel>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="flex h-9 w-full rounded-3xl border border-transparent bg-input/50 px-4 py-2 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3"
                />
              </Field>

              <Field className="space-y-1.5">
                <FieldLabel className="text-xs font-medium">Mật khẩu mới</FieldLabel>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="flex h-9 w-full rounded-3xl border border-transparent bg-input/50 px-4 py-2 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3"
                />
              </Field>

              <Field className="space-y-1.5">
                <FieldLabel className="text-xs font-medium">Xác nhận mật khẩu mới</FieldLabel>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="flex h-9 w-full rounded-3xl border border-transparent bg-input/50 px-4 py-2 text-sm transition-[color,box-shadow,background-color] outline-none focus-visible:border-ring focus-visible:ring-3"
                />
              </Field>

              <Button type="submit" className="w-full" disabled={isPwdPending}>
                {isPwdPending ? "Đang lưu..." : "Đổi mật khẩu"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

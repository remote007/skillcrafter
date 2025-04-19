import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import DashboardNavbar from "@/components/layout/DashboardNavbar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Link2, 
  Globe, 
  Twitter, 
  Linkedin, 
  Github,
  Instagram,
  Save,
  Loader2
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Profile form schema
const profileSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  username: z.string().min(3, "Username must be at least 3 characters").regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens"),
  email: z.string().email("Invalid email format"),
  bio: z.string().optional(),
  profileImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

// Social links schema
const socialLinksSchema = z.object({
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  twitter: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  github: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  instagram: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Confirm password is required"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type SocialLinksFormValues = z.infer<typeof socialLinksSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function Profile() {
  const { user, updateProfileMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("general");
  
  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      username: user?.username || "",
      email: user?.email || "",
      bio: user?.bio || "",
      profileImage: user?.profileImage || "",
    },
  });
  
  // Social links form
  const socialLinksForm = useForm<SocialLinksFormValues>({
    resolver: zodResolver(socialLinksSchema),
    defaultValues: {
      website: user?.socialLinks?.website || "",
      twitter: user?.socialLinks?.twitter || "",
      linkedin: user?.socialLinks?.linkedin || "",
      github: user?.socialLinks?.github || "",
      instagram: user?.socialLinks?.instagram || "",
    },
  });
  
  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Handle profile form submission
  const onProfileSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };
  
  // Handle social links form submission
  const onSocialLinksSubmit = (values: SocialLinksFormValues) => {
    updateProfileMutation.mutate({
      socialLinks: values
    });
  };
  
  // Handle password form submission
  const onPasswordSubmit = (values: PasswordFormValues) => {
    // Implement password change logic here
    // This would typically be a separate mutation
    console.log(values);
  };
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user?.name) return "U";
    
    const names = user.name.split(" ");
    if (names.length === 1) return names[0][0];
    return `${names[0][0]}${names[names.length - 1][0]}`;
  };
  
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <DashboardSidebar />

      <div className="flex-1 md:ml-64">
        <DashboardNavbar title="Profile Settings" />

        <main className="p-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
                Profile Settings
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage your account and portfolio settings
              </p>
            </div>
            
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="px-4 py-2 border-b">
                  <TabsList className="grid grid-cols-3 w-full lg:w-auto">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="social">Social Media</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                  </TabsList>
                </div>
                
                {/* General Tab */}
                <TabsContent value="general" className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3 flex flex-col items-center">
                      <Avatar className="h-32 w-32 mb-4">
                        <AvatarImage src={user?.profileImage} alt={user?.name} />
                        <AvatarFallback className="text-3xl">{getInitials()}</AvatarFallback>
                      </Avatar>
                      <p className="text-sm text-slate-500 text-center">
                        Public profile image.
                        <br />
                        Enter image URL in the form.
                      </p>
                    </div>
                    
                    <div className="md:w-2/3">
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                          <FormField
                            control={profileForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                      <User className="h-4 w-4" />
                                    </span>
                                    <Input className="pl-10" placeholder="Your name" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <div className="flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm">
                                      projectshelf.com/
                                    </span>
                                    <Input
                                      className="rounded-l-none"
                                      placeholder="username"
                                      {...field}
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  This is your public profile URL.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                      <Mail className="h-4 w-4" />
                                    </span>
                                    <Input className="pl-10" placeholder="your.email@example.com" {...field} />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="A brief description about yourself"
                                    className="resize-none"
                                    rows={4}
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  This will be displayed on your public portfolio.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="profileImage"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Profile Image URL</FormLabel>
                                <FormControl>
                                  <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                      <Link2 className="h-4 w-4" />
                                    </span>
                                    <Input className="pl-10" placeholder="https://example.com/your-image.jpg" {...field} />
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  Enter a URL to your profile image.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end">
                            <Button 
                              type="submit"
                              disabled={updateProfileMutation.isPending}
                            >
                              {updateProfileMutation.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="mr-2 h-4 w-4" />
                                  Save Changes
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Social Media Tab */}
                <TabsContent value="social" className="p-6">
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Social Media Links</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Form {...socialLinksForm}>
                          <form onSubmit={socialLinksForm.handleSubmit(onSocialLinksSubmit)} className="space-y-6">
                            <FormField
                              control={socialLinksForm.control}
                              name="website"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Personal Website</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <Globe className="h-4 w-4" />
                                      </span>
                                      <Input className="pl-10" placeholder="https://yourwebsite.com" {...field} />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={socialLinksForm.control}
                              name="twitter"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Twitter</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <Twitter className="h-4 w-4" />
                                      </span>
                                      <Input className="pl-10" placeholder="https://twitter.com/username" {...field} />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={socialLinksForm.control}
                              name="linkedin"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>LinkedIn</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <Linkedin className="h-4 w-4" />
                                      </span>
                                      <Input className="pl-10" placeholder="https://linkedin.com/in/username" {...field} />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={socialLinksForm.control}
                              name="github"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>GitHub</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <Github className="h-4 w-4" />
                                      </span>
                                      <Input className="pl-10" placeholder="https://github.com/username" {...field} />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={socialLinksForm.control}
                              name="instagram"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Instagram</FormLabel>
                                  <FormControl>
                                    <div className="relative">
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <Instagram className="h-4 w-4" />
                                      </span>
                                      <Input className="pl-10" placeholder="https://instagram.com/username" {...field} />
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="flex justify-end">
                              <Button 
                                type="submit"
                                disabled={updateProfileMutation.isPending}
                              >
                                {updateProfileMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Social Links
                                  </>
                                )}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                {/* Security Tab */}
                <TabsContent value="security" className="p-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Change Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                          <FormField
                            control={passwordForm.control}
                            name="currentPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Current Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Your current password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={passwordForm.control}
                            name="newPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="New password" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Password must be at least 8 characters long.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={passwordForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Confirm New Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Confirm new password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end">
                            <Button type="submit">
                              <Save className="mr-2 h-4 w-4" />
                              Update Password
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                  
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Account Security</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
                            <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
                          </div>
                          <Badge variant="outline" className="text-slate-500">Coming Soon</Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="text-sm font-medium">Session Management</h4>
                            <p className="text-sm text-slate-500">Manage active login sessions</p>
                          </div>
                          <Badge variant="outline" className="text-slate-500">Coming Soon</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

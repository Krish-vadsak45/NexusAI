"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, feedbackSchema, type ContactFormValues, type FeedbackFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Mail, MessageSquare, Send, Sparkles, Star, User, Monitor, Wand2, ShieldCheck, Heart } from "lucide-react";
import axios from "axios";

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState("contact");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Contact Form
  const {
    register: registerContact,
    handleSubmit: handleSubmitContact,
    reset: resetContact,
    formState: { errors: contactErrors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  // Feedback Form
  const {
    register: registerFeedback,
    handleSubmit: handleSubmitFeedback,
    reset: resetFeedback,
    setValue: setFeedbackValue,
    watch: watchFeedback,
    formState: { errors: feedbackErrors },
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      rating: "5",
      category: "ui",
      tool: "none"
    }
  });

  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case "1": return "Poor";
      case "2": return "Fair";
      case "3": return "Good";
      case "4": return "Very Good";
      case "5": return "Excellent";
      default: return "";
    }
  };

  const onContactSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/contact", data);

      if (response.status === 200) {
        toast.success(response.data.message);
        resetContact();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to connect to server";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFeedbackSubmit = async (data: FeedbackFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/feedback", data);

      if (response.status === 200) {
        toast.success(response.data.message);
        resetFeedback();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "Failed to connect to server";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20 px-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-purple-600/20 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
            Get in <span className="text-blue-500">Touch</span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
            Have questions or suggestions? We'd love to hear from you. Select the form below to reach out.
          </p>
        </motion.div>

        <Tabs 
          defaultValue="contact" 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <div className="flex justify-center mb-12">
            <TabsList className="bg-white/5 border border-white/10 p-1.5 h-14 rounded-2xl backdrop-blur-2xl relative">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl -z-10 blur-xl opacity-50"
              />
              <TabsTrigger 
                value="contact" 
                className="rounded-xl px-10 text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Contact Us
              </TabsTrigger>
              <div className="w-px h-6 bg-white/10 mx-1 self-center" />
              <TabsTrigger 
                value="feedback" 
                className="rounded-xl px-10 text-sm font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 transition-all flex items-center gap-2"
              >
                <Heart className="h-4 w-4" />
                Feedback
              </TabsTrigger>
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'contact' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === 'contact' ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="contact" className="mt-0">
                <Card className="bg-white/5 border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden rounded-3xl">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
                  <CardHeader>
                    <CardTitle className="text-2xl text-white flex items-center gap-2">
                       <Mail className="h-5 w-5 text-blue-500" />
                       Send a Message
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      We'll get back to you within 24 hours.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitContact(onContactSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-white/70">Full Name</Label>
                          <div className="relative group">
                             <User className="absolute left-3 top-3 h-4 w-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                             <Input 
                               id="name" 
                               {...registerContact("name")}
                               placeholder="John Doe" 
                               className="bg-white/5 border-white/10 pl-10 h-12 text-white focus:border-blue-500 transition-all rounded-xl"
                             />
                          </div>
                          {contactErrors.name && <p className="text-xs text-red-400 mt-1">{contactErrors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-white/70">Email Address</Label>
                          <div className="relative group">
                             <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                             <Input 
                               id="email" 
                               type="email"
                               {...registerContact("email")}
                               placeholder="john@example.com" 
                               className="bg-white/5 border-white/10 pl-10 h-12 text-white focus:border-blue-500 transition-all rounded-xl"
                             />
                          </div>
                          {contactErrors.email && <p className="text-xs text-red-400 mt-1">{contactErrors.email.message}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-white/70">Subject</Label>
                        <div className="relative group">
                          <Sparkles className="absolute left-3 top-3 h-4 w-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                          <Input 
                            id="subject" 
                            {...registerContact("subject")}
                            placeholder="How can we help?" 
                            className="bg-white/5 border-white/10 pl-10 h-12 text-white focus:border-blue-500 transition-all rounded-xl"
                          />
                        </div>
                        {contactErrors.subject && <p className="text-xs text-red-400 mt-1">{contactErrors.subject.message}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-white/70">Message</Label>
                        <Textarea 
                          id="message" 
                          {...registerContact("message")}
                          placeholder="Tell us what's on your mind..." 
                          className="bg-white/5 border-white/10 min-h-[150px] text-white focus:border-blue-500 transition-all rounded-xl resize-none"
                        />
                        {contactErrors.message && <p className="text-xs text-red-400 mt-1">{contactErrors.message.message}</p>}
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98]"
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                        {!isSubmitting && <Send className="ml-2 h-5 w-5" />}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="feedback" className="mt-0">
                <Card className="bg-white/5 border-white/10 backdrop-blur-2xl shadow-2xl overflow-hidden rounded-3xl">
                  <div className="absolute top-0 left-0 w-full h-1 bg-purple-600" />
                  <CardHeader>
                    <CardTitle className="text-2xl text-white flex items-center gap-2">
                       <MessageSquare className="h-5 w-5 text-purple-500" />
                       Provide Feedback
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Your insights help us improve NexusAI for everyone.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmitFeedback(onFeedbackSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="f-name" className="text-white/70">Name</Label>
                          <Input 
                            id="f-name" 
                            {...registerFeedback("name")}
                            placeholder="Your name" 
                            className="bg-white/5 border-white/10 h-12 text-white focus:border-purple-500 transition-all rounded-xl"
                          />
                          {feedbackErrors.name && <p className="text-xs text-red-400 mt-1">{feedbackErrors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="f-email" className="text-white/70">Email</Label>
                          <Input 
                            id="f-email" 
                            type="email"
                            {...registerFeedback("email")}
                            placeholder="your@email.com" 
                            className="bg-white/5 border-white/10 h-12 text-white focus:border-purple-500 transition-all rounded-xl"
                          />
                          {feedbackErrors.email && <p className="text-xs text-red-400 mt-1">{feedbackErrors.email.message}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label className="text-white/70">Overall Rating</Label>
                          <div className="flex flex-col gap-2">
                            <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-xl h-12">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onMouseEnter={() => setHoverRating(star)}
                                  onMouseLeave={() => setHoverRating(null)}
                                  onClick={() => setFeedbackValue("rating", star.toString() as any)}
                                  className="flex-1 flex items-center justify-center transition-all relative group"
                                >
                                  <motion.div
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Star 
                                      className={`h-5 w-5 transition-colors ${
                                        (hoverRating !== null ? star <= hoverRating : star <= parseInt(watchFeedback("rating")))
                                          ? "fill-purple-400 text-purple-400" 
                                          : "text-gray-500"
                                      }`} 
                                    />
                                  </motion.div>
                                </button>
                              ))}
                            </div>
                            <div className="flex justify-between px-1">
                              <span className="text-[10px] uppercase font-bold text-gray-500">
                                {getRatingLabel(watchFeedback("rating"))}
                              </span>
                              <span className="text-[10px] uppercase font-bold text-purple-500">
                                {watchFeedback("rating")}/5
                              </span>
                            </div>
                          </div>
                          {feedbackErrors.rating && <p className="text-xs text-red-400 mt-1">{feedbackErrors.rating.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-white/70">Category</Label>
                          <Select 
                            onValueChange={(val) => setFeedbackValue("category", val as any)}
                            defaultValue="ui"
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 h-12 text-white focus:ring-purple-500 rounded-xl">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-white/10 text-white">
                              <SelectItem value="ui">User Interface</SelectItem>
                              <SelectItem value="performance">Performance</SelectItem>
                              <SelectItem value="features">New Features</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {feedbackErrors.category && <p className="text-xs text-red-400 mt-1">{feedbackErrors.category.message}</p>}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tool" className="text-white/70">Which Tool?</Label>
                          <Select 
                            onValueChange={(val) => setFeedbackValue("tool", val as any)}
                            defaultValue="none"
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 h-12 text-white focus:ring-purple-500 rounded-xl">
                              <SelectValue placeholder="Which tool?" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-white/10 text-white">
                              <SelectItem value="none">General / All Tools</SelectItem>
                              <SelectItem value="article-writer">Article Writer</SelectItem>
                              <SelectItem value="title-generator">Title Generator</SelectItem>
                              <SelectItem value="summarizer">Text Summarizer</SelectItem>
                              <SelectItem value="code-generator">Code Generator</SelectItem>
                              <SelectItem value="image-generation">Image Generation</SelectItem>
                              <SelectItem value="bg-removal">Background Removal</SelectItem>
                              <SelectItem value="object-removal">Object Removal</SelectItem>
                              <SelectItem value="resume-reviewer">Resume Reviewer</SelectItem>
                              <SelectItem value="video-repurposer">Video Repurposer</SelectItem>
                            </SelectContent>
                          </Select>
                          {feedbackErrors.tool && <p className="text-xs text-red-400 mt-1">{feedbackErrors.tool.message}</p>}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="feedback" className="text-white/70">Your Feedback</Label>
                        <Textarea 
                          id="feedback" 
                          {...registerFeedback("feedback")}
                          placeholder="What would you like to see improved?" 
                          className="bg-white/5 border-white/10 min-h-[120px] text-white focus:border-purple-500 transition-all rounded-xl resize-none"
                        />
                        {feedbackErrors.feedback && <p className="text-xs text-red-400 mt-1">{feedbackErrors.feedback.message}</p>}
                      </div>

                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full h-14 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all active:scale-[0.98]"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Feedback"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>

        {/* Info Blocks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
           <motion.div 
             whileHover={{ y: -5 }}
             className="p-8 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center text-center backdrop-blur-xl relative group overflow-hidden"
           >
             <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="h-14 w-14 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
                <Mail className="h-7 w-7 text-blue-500" />
             </div>
             <h4 className="text-white font-bold text-lg mb-2">Email Support</h4>
             <p className="text-sm text-gray-400 mb-4">Dedicated help for regular users.</p>
             <a href="mailto:support@nexusai.com" className="text-blue-500 text-sm font-semibold hover:underline">support@nexusai.com</a>
           </motion.div>

           <motion.div 
             whileHover={{ y: -5 }}
             className="p-8 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center text-center backdrop-blur-xl relative group overflow-hidden"
           >
             <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="h-14 w-14 bg-purple-600/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
                <MessageSquare className="h-7 w-7 text-purple-500" />
             </div>
             <h4 className="text-white font-bold text-lg mb-2">Community</h4>
             <p className="text-sm text-gray-400 mb-4">Join 10k+ creators on Discord.</p>
             <button className="text-purple-500 text-sm font-semibold hover:underline">Join Our Discord</button>
           </motion.div>

           <motion.div 
             whileHover={{ y: -5 }}
             className="p-8 bg-white/5 border border-white/10 rounded-3xl flex flex-col items-center text-center backdrop-blur-xl relative group overflow-hidden"
           >
             <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="h-14 w-14 bg-emerald-600/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <ShieldCheck className="h-7 w-7 text-emerald-500" />
             </div>
             <h4 className="text-white font-bold text-lg mb-2">Enterprise</h4>
             <p className="text-sm text-gray-400 mb-4">Custom solutions for companies.</p>
             <button className="text-emerald-500 text-sm font-semibold hover:underline">Talk to Sales</button>
           </motion.div>
        </div>
      </div>
    </div>
  );
}

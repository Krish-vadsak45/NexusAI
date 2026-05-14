"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactSchema,
  feedbackSchema,
  type ContactFormValues,
  type FeedbackFormValues,
} from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Mail,
  MessageSquare,
  Send,
  Sparkles,
  Star,
  User,
  ShieldCheck,
  Heart,
} from "lucide-react";
import axios from "axios";
import { getErrorMessage } from "@/lib/error-utils";

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
      tool: "none",
    },
  });

  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case "1":
        return "Poor";
      case "2":
        return "Fair";
      case "3":
        return "Good";
      case "4":
        return "Very Good";
      case "5":
        return "Excellent";
      default:
        return "";
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
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(
        error,
        "Failed to connect to server",
      );
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
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(
        error,
        "Failed to connect to server",
      );
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-4 pb-16 pt-20 sm:px-6 sm:pb-20 sm:pt-24">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-30">
        <div className="absolute left-[10%] top-[10%] h-[280px] w-[280px] rounded-full bg-blue-600/20 blur-[120px] sm:h-[500px] sm:w-[500px]" />
        <div className="absolute bottom-[10%] right-[10%] h-[220px] w-[220px] rounded-full bg-purple-600/20 blur-[120px] sm:h-[400px] sm:w-[400px]" />
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
            Have questions or suggestions? We&apos;d love to hear from you.
            Select the form below to reach out.
          </p>
        </motion.div>

        <Tabs
          defaultValue="contact"
          onValueChange={setActiveTab}
          className="w-full"
        >
        <div className="mb-10 flex justify-center sm:mb-12">
            <TabsList className="relative grid h-auto w-full max-w-xl grid-cols-1 gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-2xl sm:h-14 sm:grid-cols-[1fr_auto_1fr] sm:gap-0 sm:p-1.5">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl -z-10 blur-xl opacity-50" />
              <TabsTrigger
                value="contact"
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/20 sm:px-10"
              >
                <Mail className="h-4 w-4" />
                Contact Us
              </TabsTrigger>
              <div className="mx-1 hidden h-6 w-px self-center bg-white/10 sm:block" />
              <TabsTrigger
                value="feedback"
                className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/20 sm:px-10"
              >
                <Heart className="h-4 w-4" />
                Feedback
              </TabsTrigger>
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === "contact" ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === "contact" ? 20 : -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="contact" className="mt-0">
                <Card className="overflow-hidden rounded-3xl border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
                  <CardHeader>
                    <CardTitle className="text-2xl text-white flex items-center gap-2">
                      <Mail className="h-5 w-5 text-blue-500" />
                      Send a Message
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      We&apos;ll get back to you within 24 hours.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleSubmitContact(onContactSubmit)}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-white/70">
                            Full Name
                          </Label>
                          <div className="relative group">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                            <Input
                              id="name"
                              {...registerContact("name")}
                              placeholder="John Doe"
                              className="bg-white/5 border-white/10 pl-10 h-12 text-white focus:border-blue-500 transition-all rounded-xl"
                            />
                          </div>
                          {contactErrors.name && (
                            <p className="text-xs text-red-400 mt-1">
                              {contactErrors.name.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-white/70">
                            Email Address
                          </Label>
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
                          {contactErrors.email && (
                            <p className="text-xs text-red-400 mt-1">
                              {contactErrors.email.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-white/70">
                          Subject
                        </Label>
                        <div className="relative group">
                          <Sparkles className="absolute left-3 top-3 h-4 w-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                          <Input
                            id="subject"
                            {...registerContact("subject")}
                            placeholder="How can we help?"
                            className="bg-white/5 border-white/10 pl-10 h-12 text-white focus:border-blue-500 transition-all rounded-xl"
                          />
                        </div>
                        {contactErrors.subject && (
                          <p className="text-xs text-red-400 mt-1">
                            {contactErrors.subject.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-white/70">
                          Message
                        </Label>
                        <Textarea
                          id="message"
                          {...registerContact("message")}
                          placeholder="Tell us what's on your mind..."
                          className="min-h-[140px] resize-none rounded-xl border-white/10 bg-white/5 text-white transition-all focus:border-blue-500 sm:min-h-[150px]"
                        />
                        {contactErrors.message && (
                          <p className="text-xs text-red-400 mt-1">
                            {contactErrors.message.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-12 w-full rounded-xl bg-blue-600 text-base font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:bg-blue-700 active:scale-[0.98] sm:h-14 sm:text-lg"
                      >
                        {isSubmitting ? "Sending..." : "Send Message"}
                        {!isSubmitting && <Send className="ml-2 h-5 w-5" />}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="feedback" className="mt-0">
                <Card className="overflow-hidden rounded-3xl border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">
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
                    <form
                      onSubmit={handleSubmitFeedback(onFeedbackSubmit)}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="f-name" className="text-white/70">
                            Name
                          </Label>
                          <Input
                            id="f-name"
                            {...registerFeedback("name")}
                            placeholder="Your name"
                            className="bg-white/5 border-white/10 h-12 text-white focus:border-purple-500 transition-all rounded-xl"
                          />
                          {feedbackErrors.name && (
                            <p className="text-xs text-red-400 mt-1">
                              {feedbackErrors.name.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="f-email" className="text-white/70">
                            Email
                          </Label>
                          <Input
                            id="f-email"
                            type="email"
                            {...registerFeedback("email")}
                            placeholder="your@email.com"
                            className="bg-white/5 border-white/10 h-12 text-white focus:border-purple-500 transition-all rounded-xl"
                          />
                          {feedbackErrors.email && (
                            <p className="text-xs text-red-400 mt-1">
                              {feedbackErrors.email.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label className="text-white/70">
                            Overall Rating
                          </Label>
                          <div className="flex flex-col gap-2">
                            <div className="flex h-12 rounded-xl border border-white/10 bg-white/5 p-1.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onMouseEnter={() => setHoverRating(star)}
                                  onMouseLeave={() => setHoverRating(null)}
                                  onClick={() =>
                                    setFeedbackValue(
                                      "rating",
                                      star.toString() as FeedbackFormValues["rating"],
                                    )
                                  }
                                  className="flex-1 flex items-center justify-center transition-all relative group"
                                >
                                  <motion.div
                                    whileHover={{ scale: 1.2 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Star
                                      className={`h-5 w-5 transition-colors ${
                                        (
                                          hoverRating !== null
                                            ? star <= hoverRating
                                            : star <=
                                              parseInt(watchFeedback("rating"))
                                        )
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
                          {feedbackErrors.rating && (
                            <p className="text-xs text-red-400 mt-1">
                              {feedbackErrors.rating.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-white/70">
                            Category
                          </Label>
                          <Select
                            onValueChange={(val) =>
                              setFeedbackValue(
                                "category",
                                val as FeedbackFormValues["category"],
                              )
                            }
                            defaultValue="ui"
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 h-12 text-white focus:ring-purple-500 rounded-xl">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-white/10 text-white">
                              <SelectItem value="ui">User Interface</SelectItem>
                              <SelectItem value="performance">
                                Performance
                              </SelectItem>
                              <SelectItem value="features">
                                New Features
                              </SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {feedbackErrors.category && (
                            <p className="text-xs text-red-400 mt-1">
                              {feedbackErrors.category.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tool" className="text-white/70">
                            Which Tool?
                          </Label>
                          <Select
                            onValueChange={(val) =>
                              setFeedbackValue(
                                "tool",
                                val as FeedbackFormValues["tool"],
                              )
                            }
                            defaultValue="none"
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 h-12 text-white focus:ring-purple-500 rounded-xl">
                              <SelectValue placeholder="Which tool?" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-white/10 text-white">
                              <SelectItem value="none">
                                General / All Tools
                              </SelectItem>
                              <SelectItem value="article-writer">
                                Article Writer
                              </SelectItem>
                              <SelectItem value="title-generator">
                                Title Generator
                              </SelectItem>
                              <SelectItem value="summarizer">
                                Text Summarizer
                              </SelectItem>
                              <SelectItem value="code-generator">
                                Code Generator
                              </SelectItem>
                              <SelectItem value="image-generation">
                                Image Generation
                              </SelectItem>
                              <SelectItem value="bg-removal">
                                Background Removal
                              </SelectItem>
                              <SelectItem value="object-removal">
                                Object Removal
                              </SelectItem>
                              <SelectItem value="resume-reviewer">
                                Resume Reviewer
                              </SelectItem>
                              <SelectItem value="video-repurposer">
                                Video Repurposer
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          {feedbackErrors.tool && (
                            <p className="text-xs text-red-400 mt-1">
                              {feedbackErrors.tool.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="feedback" className="text-white/70">
                          Your Feedback
                        </Label>
                        <Textarea
                          id="feedback"
                          {...registerFeedback("feedback")}
                          placeholder="What would you like to see improved?"
                          className="min-h-[120px] resize-none rounded-xl border-white/10 bg-white/5 text-white transition-all focus:border-purple-500"
                        />
                        {feedbackErrors.feedback && (
                          <p className="text-xs text-red-400 mt-1">
                            {feedbackErrors.feedback.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-12 w-full rounded-xl bg-purple-600 text-base font-bold text-white shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all hover:bg-purple-700 active:scale-[0.98] sm:h-14 sm:text-lg"
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
        <div className="mt-16 grid grid-cols-1 gap-6 sm:mt-24 md:grid-cols-3 md:gap-8">
          <motion.div
            whileHover={{ y: -5 }}
            className="group relative flex flex-col items-center overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl sm:p-8"
          >
            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-14 w-14 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Mail className="h-7 w-7 text-blue-500" />
            </div>
            <h4 className="text-white font-bold text-lg mb-2">Email Support</h4>
            <p className="text-sm text-gray-400 mb-4">
              Dedicated help for regular users.
            </p>
            <a
              href="mailto:support@nexusai.com"
              className="text-blue-500 text-sm font-semibold hover:underline"
            >
              support@nexusai.com
            </a>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="group relative flex flex-col items-center overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl sm:p-8"
          >
            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-14 w-14 bg-purple-600/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:scale-110 transition-transform">
              <MessageSquare className="h-7 w-7 text-purple-500" />
            </div>
            <h4 className="text-white font-bold text-lg mb-2">Community</h4>
            <p className="text-sm text-gray-400 mb-4">
              Join 10k+ creators on Discord.
            </p>
            <button className="text-purple-500 text-sm font-semibold hover:underline">
              Join Our Discord
            </button>
          </motion.div>

          <motion.div
            whileHover={{ y: -5 }}
            className="group relative flex flex-col items-center overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl sm:p-8"
          >
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="h-14 w-14 bg-emerald-600/10 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-7 w-7 text-emerald-500" />
            </div>
            <h4 className="text-white font-bold text-lg mb-2">Enterprise</h4>
            <p className="text-sm text-gray-400 mb-4">
              Custom solutions for companies.
            </p>
            <button className="text-emerald-500 text-sm font-semibold hover:underline">
              Talk to Sales
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

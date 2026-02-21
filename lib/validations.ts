import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const feedbackSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  rating: z.enum(["1", "2", "3", "4", "5"], {
    required_error: "Please select a rating",
  }),
  category: z.enum(["ui", "performance", "features", "other"], {
    required_error: "Please select a category",
  }),
  tool: z.enum([
    "article-writer",
    "title-generator",
    "summarizer",
    "code-generator",
    "image-generation",
    "bg-removal",
    "object-removal",
    "resume-reviewer",
    "video-repurposer",
    "none"
  ]).optional(),
  feedback: z.string().min(10, "Feedback must be at least 10 characters"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
export type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export const PLANS = {
  FREE: {
    id: "free",
    name: "Free",
    price: 0,

    limits: {
      articlesPerDay: 3,
      titlesPerDay: 5,
      imagesPerDay: 0,
      backgroundRemovalsPerDay: 0,
      objectRemovalsPerDay: 0,
      resumeReviewsPerDay: 0,
      textSummariesPerDay: 0,
      codeGenerationsPerDay: 0,
      maxWords: 600,
      tokensPerMonth: 10_000,
    },

    features: {
      article_writer: true,
      title_generator: true,
      image_generation: false,
      background_removal: false,
      object_removal: false,
      resume_reviewer: false,
      text_summarizer: false,
      code_generator: false,
    },
  },

  PRO: {
    id: "pro",
    name: "Pro",
    price: 29,

    limits: {
      articlesPerDay: 50,
      titlesPerDay: 100,
      imagesPerDay: 20,
      backgroundRemovalsPerDay: 20,
      objectRemovalsPerDay: 20,
      resumeReviewsPerDay: 10,
      textSummariesPerDay: 20,
      codeGenerationsPerDay: 20,
      maxWords: 3000,
      tokensPerMonth: 200_000,
    },

    features: {
      article_writer: true,
      title_generator: true,
      image_generation: true,
      background_removal: true,
      object_removal: true,
      resume_reviewer: true,
      text_summarizer: true,
      code_generator: true,
    },
  },

  PREMIUM: {
    id: "premium",
    name: "Premium",
    price: 99,

    limits: {
      articlesPerDay: 200,
      titlesPerDay: 500,
      imagesPerDay: 100,
      backgroundRemovalsPerDay: 100,
      objectRemovalsPerDay: 100,
      resumeReviewsPerDay: 50,
      textSummariesPerDay: 100,
      codeGenerationsPerDay: 100,
      maxWords: 6000,
      tokensPerMonth: 1_000_000,
    },

    features: {
      article_writer: true,
      title_generator: true,
      image_generation: true,
      background_removal: true,
      object_removal: true,
      resume_reviewer: true,
      text_summarizer: true,
      code_generator: true,
    },
  },
} as const;

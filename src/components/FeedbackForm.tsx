import { motion } from "framer-motion";
import { useState } from "react";
import { useForm, ValidationError } from "@formspree/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, MessageSquare, Loader2, CheckCircle } from "lucide-react";
import { z } from "zod";

const feedbackSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().max(255, "Email too long").optional().refine((val) => !val || z.string().email().safeParse(val).success, "Invalid email address"),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000, "Message too long"),
});

const FeedbackForm = () => {
  const [state, handleFormspreeSubmit] = useForm("mdanvknw");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const result = feedbackSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    // If validation passes, submit to Formspree
    await handleFormspreeSubmit(e);
  };

  return (
    <section id="feedback" className="py-24 px-6">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-border/50 mb-6">
            <MessageSquare className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">I'd love to hear from you</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Share your <span className="text-gradient">feedback</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Have ideas, suggestions, or found a bug? Let me know and help me improve.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {state.succeeded ? (
            <div className="glass rounded-2xl p-8 border border-border/50 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-background" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Thank you!</h3>
              <p className="text-muted-foreground">Your feedback has been sent. I'll review it soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 border border-border/50">
              <div className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="text-sm font-medium text-foreground mb-2 block">
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="bg-secondary border-border/50 focus:ring-primary"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">{errors.name}</p>
                    )}
                    <ValidationError prefix="Name" field="name" errors={state.errors} className="text-sm text-destructive mt-1" />
                  </div>
                  <div>
                    <label htmlFor="email" className="text-sm font-medium text-foreground mb-2 block">
                      Email <span className="text-muted-foreground text-xs font-normal">(Only for feedback — no marketing spam)</span>
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="text"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com (I'll reach out for your feedback!)"
                      className="bg-secondary border-border/50 focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground/70 mt-2 leading-relaxed">
                      I value your suggestions more than your data. If you share your email, I'll only use it to ask for your thoughts on how to make SnippetMotion better for you.
                    </p>
                    {errors.email && (
                      <p className="text-sm text-destructive mt-1">{errors.email}</p>
                    )}
                    <ValidationError prefix="Email" field="email" errors={state.errors} className="text-sm text-destructive mt-1" />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="text-sm font-medium text-foreground mb-2 block">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us what you think..."
                    className="min-h-[120px] bg-secondary border-border/50 resize-none focus:ring-primary"
                  />
                  {errors.message && (
                    <p className="text-sm text-destructive mt-1">{errors.message}</p>
                  )}
                  <ValidationError prefix="Message" field="message" errors={state.errors} className="text-sm text-destructive mt-1" />
                </div>

                <Button
                  type="submit"
                  disabled={state.submitting}
                  className="w-full bg-gradient-to-r from-primary to-accent text-background font-semibold h-12 btn-glow hover:opacity-90 transition-opacity"
                >
                  {state.submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Feedback
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default FeedbackForm;

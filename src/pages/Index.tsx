import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CodeEditor from "@/components/CodeEditor";
import LanguageMarquee from "@/components/LanguageMarquee";
import Features from "@/components/Features";
import Showcase from "@/components/Showcase";
import UseCases from "@/components/UseCases";
import FeedbackForm from "@/components/FeedbackForm";
import Footer from "@/components/Footer";
const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
          <CodeEditor />
          <LanguageMarquee />
          <UseCases />
          <Features />
          <Showcase />
          <FeedbackForm />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;

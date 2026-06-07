import { AppShell, Icon } from "@/components/app-shell";

const questions = [
  {
    number: "1.1",
    title: "Describe your business",
    required: true,
    helper: "For example: restaurant, beauty studio, roofing, fitness, legal services, or another local business.",
    placeholder: "Tell us your industry, city, target customers, main product, service, or campaign...",
    type: "textarea",
  },
  {
    number: "1.2",
    title: "Reference creator profile link",
    required: false,
    helper: "If there are creators you like, paste their Instagram, TikTok, YouTube, or Xiaohongshu profiles.",
    placeholder: "https://www.instagram.com/example",
    type: "url",
  },
  {
    number: "1.3",
    title: "Competitor video link",
    required: false,
    helper: "Paste one or more competitor videos you want us to reference. AI will analyze the content and audience signals.",
    placeholder: "Paste competitor video URLs, separated by commas or line breaks...",
    type: "textarea",
  },
  {
    number: "1.4",
    title: "Describe your ideal creator",
    required: false,
    helper: "Tell us the creator vibe, audience size, content style, language, budget, or any constraints.",
    placeholder: "For example: LA-based, warm and trustworthy, short-form restaurant videos, strong local engagement...",
    type: "textarea",
  },
];

export default function HomePage() {
  return (
    <AppShell activeNav="creator-studio">
      <div className="agent-page">
        <section className="agent-panel" aria-labelledby="agent-title">
          <div className="agent-heading">
            <span className="agent-spark">
              <Icon name="spark" />
            </span>
            <div>
              <h1 id="agent-title">AI Agent Questions</h1>
              <p>Please answer in order. You can type into each field below.</p>
            </div>
          </div>

          <form className="question-list">
            {questions.map(question => (
              <label className="question-card" key={question.number}>
                <span className="question-title-row">
                  <span className="question-number">{question.number}</span>
                  <span>
                    <strong>
                      {question.title}
                      {question.required ? <em>*</em> : <small>Optional</small>}
                    </strong>
                    <span>{question.helper}</span>
                  </span>
                </span>

                <span className={question.type === "url" ? "input-shell url-shell" : "input-shell"}>
                  {question.type === "url" ? <Icon name="link" /> : null}
                  {question.type === "url" ? (
                    <input type="url" placeholder={question.placeholder} />
                  ) : (
                    <textarea placeholder={question.placeholder} />
                  )}
                </span>
              </label>
            ))}

            <button className="generate-button" type="button">
              <Icon name="wand" />
              Generate Creator Persona
            </button>
          </form>
        </section>
      </div>
    </AppShell>
  );
}

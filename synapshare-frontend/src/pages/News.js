import { useState, useEffect } from "react";
import axios from "axios";

function News() {
  const [news, setNews] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Fetching tech news only from NewsAPI
        const response = await axios.get(
          "https://newsapi.org/v2/top-headlines?country=us&category=technology&apiKey=7f7f546fbd314798a492cda57f6922d2"
        );
        setNews(response.data.articles || []); // Ensure it's an array
      } catch (err) {
        console.error("News Fetch Error:", err);
        setError("Failed to fetch tech news articles. Please try again later.");
      }
    };
    fetchNews();
  }, []);

  return (
    <div className="relative z-10 max-w-4xl mx-auto mt-16">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">
        Latest Tech News
      </h1>
      {error && (
        <p className="text-red-500 dark:text-red-400 mb-4 bg-red-100/50 dark:bg-red-900/50 p-3 rounded-lg">
          {error}
        </p>
      )}
      <div className="grid gap-6">
        {news.length === 0 && !error && (
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Loading tech news...
          </p>
        )}
        {news.map((article, index) => (
          <div
            key={index} // Use a unique key; if using Firebase, use article.id
            className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
              {article.title || "No Title"} {/* Render specific property */}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {article.description || "No description available."}
            </p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Read more
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default News;

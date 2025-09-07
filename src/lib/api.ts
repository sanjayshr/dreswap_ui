import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://172.28.5.89:8081/api/v1";

export const generateStyle = async (
  image: File,
  eventType: string,
  venue: string,
  theme: string
) => {
  const formData = new FormData();
  formData.append("image", image);
  formData.append(
    "data",
    JSON.stringify({
      eventType,
      venue,
      theme,
    })
  );

  try {
    const response = await axios.post(`${API_URL}/generate`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      responseType: "blob",
    });

    const sessionId = response.headers["x-session-id"];
    const imageUrl = URL.createObjectURL(response.data);

    return { sessionId, imageUrl };
  } catch (error) {
    console.error("Error generating style:", error);
    throw error;
  }
};

export const getStyles = async (sessionId: string) => {
  try {
    const response = await axios.get(`${API_URL}/styles`, {
      headers: {
        "X-Session-ID": sessionId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching styles:", error);
    throw error;
  }
};

export const swapStyle = async (sessionId: string, styleIndex: number) => {
  try {
    const response = await axios.post(
      `${API_URL}/swap-style`,
      { styleIndex },
      {
        headers: {
          "X-Session-ID": sessionId,
          "Content-Type": "application/json",
        },
        responseType: "blob",
      }
    );
    const imageUrl = URL.createObjectURL(response.data);
    return { imageUrl };
  } catch (error) {
    console.error("Error swapping style:", error);
    throw error;
  }
};
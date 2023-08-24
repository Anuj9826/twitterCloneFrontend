import React, { useState, useEffect } from "react";
import { Box, Button, Input, VStack, Divider } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import withAuthentication from "./withAuthenication";
import { backend_url } from "./backendURL";

const Dashboard = () => {
  const navigate = useNavigate();
  const [tweets, setTweets] = useState([]);
  const [newTweet, setNewTweet] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedTweet, setEditedTweet] = useState("");

  const handleEditInputChange = (e, index) => {
    const updatedTweets = [...tweets];
    updatedTweets[index] = e.target.value;
    setTweets(updatedTweets);
    setEditedTweet(e.target.value);
  };

  const handleEditButtonClick = (index) => {
    if (editingIndex === index) {
      handleEditTweet(index);
    } else {
      setEditingIndex(index);
      setEditedTweet(tweets[index]);
    }
  };

  const handleNewTweet = async () => {
    if (newTweet.trim() !== "") {
      if (editingIndex !== null) {
        // ... (other editing logic)
      } else {
        try {
          const token = localStorage.getItem("accessToken");
          const user = localStorage.getItem("userId");
          const res = await fetch(`${backend_url}/tweets`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ user, tweet: newTweet }),
          });

          const data = await res.json();
          localStorage.setItem("tweetId", data.data._id);
          if (res.ok) {
            alert("tweet created");
            setTweets([...tweets, newTweet]);
            setNewTweet("");
          } else if (data.message || data.msg) {
            alert(data.message || data.msg);
          }
        } catch (error) {
          alert("An error occurred while posting tweet", error);
        }
      }
    }
  };

  const handleEditTweet = async (index) => {
    const tweetId = localStorage.getItem("tweetId");
    try {
      if (editedTweet !== null) {
        const token = localStorage.getItem("accessToken");
        const user = localStorage.getItem("userId");
        const response = await fetch(`${backend_url}/tweets/${tweetId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ user, tweet: editedTweet }),
        });

        if (response.ok) {
          const updatedTweets = [...tweets];
          updatedTweets[index] = editedTweet;
          setTweets(updatedTweets);
          alert("Tweet edited successfully");
        } else if (response.message || response.msg) {
          alert(response.message || response.msg);
        }
      }
    } catch (error) {
      alert("An error occurred while posting tweet", error);
    }
  };

  const handleDeleteTweet = async (index) => {
    const tweetId = localStorage.getItem("tweetId");
    try {
      const token = localStorage.getItem("accessToken");
      const user = localStorage.getItem("userId");
      const response = await fetch(`${backend_url}/tweets/${tweetId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user }),
      });

      if (response.ok) {
        const updatedTweets = tweets.filter((_, i) => i !== index);
        setTweets(updatedTweets);
        alert("Tweet delete successfully");
      } else if (response.message || response.msg) {
        alert(response.message || response.msg);
      }
    } catch (error) {
      alert("An error occurred while posting tweet", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Unauthorized User");
      navigate("/login");
    }
  }, [navigate]);

  return (
    <Box style={{ textAlign: "center" }}>
      <h1>Welcome to the Twitter Apps</h1>
      <VStack spacing={4} mt={4} align="center">
        <Input
          size="lg"
          width="30%"
          placeholder="What's happening?"
          value={newTweet}
          onChange={(e) => setNewTweet(e.target.value)}
        />
        <Button
          colorScheme="teal"
          size="lg"
          onClick={handleNewTweet}
          alignSelf="center"
        >
          {editingIndex !== null ? "Save Edit" : "Tweet"}
        </Button>
      </VStack>
      <Divider mt={4} />
      <VStack spacing={4} mt={4} align="stretch">
        {tweets.map((tweet, index) => (
          <Box key={index} p={4} borderRadius="md">
            {editingIndex === index ? (
              <VStack spacing={2} alignItems="center">
                <Input
                  size="lg"
                  width="30%"
                  placeholder="Edit Tweet"
                  value={editedTweet}
                  onChange={(e) => handleEditInputChange(e, index)}
                />
                <Button
                  size="lg"
                  colorScheme="blue"
                  onClick={() => handleEditButtonClick(index)}
                  mr={2}
                >
                  Save
                </Button>
                <Button
                  size="lg"
                  colorScheme="red"
                  onClick={() => handleDeleteTweet(index)}
                >
                  Delete
                </Button>
              </VStack>
            ) : (
              <>
                <p>{tweet}</p>
                <Button
                  size="lg"
                  colorScheme="blue"
                  onClick={() => handleEditButtonClick(index)}
                  mr={2}
                >
                  Edit
                </Button>
                <Button
                  size="lg"
                  colorScheme="red"
                  onClick={() => handleDeleteTweet(index)}
                >
                  Delete
                </Button>
              </>
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default withAuthentication(Dashboard);

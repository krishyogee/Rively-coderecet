from youtube_transcript_api import YouTubeTranscriptApi

# Fetch the transcript
transcript = YouTubeTranscriptApi.get_transcript("glq_YuxUlPU")

# Print each line of the transcript
for line in transcript:
    print(line)
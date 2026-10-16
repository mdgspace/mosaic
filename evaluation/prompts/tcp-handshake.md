# Benchmark Prompt: TCP 3-Way Handshake

## Educational Goal
Create an interactive learning experience that teaches the TCP 3-Way Handshake protocol used to establish reliable network connections.

The learner should develop an intuitive understanding of sequence numbers ($SEQ$), acknowledgment numbers ($ACK$), client and server state transitions (`LISTEN`, `SYN_SENT`, `SYN_RCVD`, `ESTABLISHED`), and why three packets are necessary to synchronize two endpoints over an unreliable network.

## Learner Experience & Requirements
1. **Interactive Connection Lifecycle**:
   * The learner should be able to initiate a connection, step message-by-message through the handshake, simulate network delay or dropped packets (if applicable), and reset the connection.
2. **Visual Representation**:
   * Visualize the Client node and Server node as distinct endpoints with their active TCP connection states clearly displayed.
   * Visualize the physical message packets in transit between client and server across the network.
   * Step through the 3 phases:
     1. **SYN**: Client sends initial sequence number ($SEQ = x$).
     2. **SYN-ACK**: Server acknowledges ($ACK = x + 1$) and sends its sequence number ($SEQ = y$).
     3. **ACK**: Client acknowledges server sequence number ($ACK = y + 1$), establishing bidirectional communication.
3. **Protocol Timeline & Event Log**:
   * Display a chronological timeline showing the stages of connection establishment.
   * Log each packet exchange with its sequence number, acknowledgment flag, and resulting endpoint state change.
4. **Prediction & Active Inquiry**:
   * Prompt the learner to predict what acknowledgment number the server will send in response to the client's initial sequence number before advancing the step.
5. **Pedagogical Explanation**:
   * Explain why a 2-way handshake is insufficient to establish full-duplex reliability and protect against delayed duplicate packets.
   * Explain the meaning and purpose of sequence and acknowledgment numbers.
6. **Knowledge Check**:
   * Include a short assessment with immediate feedback verifying understanding of TCP states and sequence number mathematics.


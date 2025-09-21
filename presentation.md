---
marp: true
theme: default
class: lead
paginate: true
---

# 🌐 State Machines & Actors

---

## 🔹 What is a State Machine?

- A **model** of computation with:
  - **States** – distinct conditions
  - **Events/Inputs** – triggers
  - **Transitions** – rules for moving between states
- The system is always in **one state at a time**

---

## 🚦 Example: Traffic Light

**States:**

- Red → Green → Yellow

**Transitions:**

- Timer → Red → Green
- Timer → Green → Yellow
- Timer → Yellow → Red

---

## 🔹 State Machines in Practice

- Frontend apps (UI flows)
- Networking protocols (TCP states)
- Games (Player: Idle → Running → Jumping)
- Embedded systems (washing machine cycle)
- Workflows (Order: Created → Paid → Shipped → Delivered)

---

## 🎭 What is an Actor?

- Independent unit with its own **state**
- Communicates only via **messages/events**
- On receiving a message, it may:
  - Update its state
  - Send messages to other actors
  - Spawn new actors

---

## 🔹 State Machine Actors

- An **actor whose logic is defined as a state machine**
- Encapsulates:
  - States
  - Transitions
  - Event handling
- Runs independently, talks via messages

---

## 🛒 Example: Online Order System

- **OrderActor**: Created → Paid → Shipped → Delivered
- **PaymentActor**: Idle → Processing → Success/Failure
- **ShippingActor**: Pending → InTransit → Delivered

➡ Actors coordinate by **sending events**:

- OrderActor → PaymentActor: `PAYMENT_REQUESTED`
- PaymentActor → OrderActor: `PAYMENT_SUCCESS`
- OrderActor → ShippingActor: `START_SHIPPING`

---

## ✅ Why Use State Machine Actors?

- **Encapsulation** – each actor owns its logic
- **Concurrency** – many actors run in parallel
- **Hierarchy** – build complex systems from smaller actors
- **Predictability** – clear state + event rules

---

# 🎯 Summary

- **State machine**: A system with states, events, and transitions
- **Actor**: Independent unit that processes messages
- **State machine actor**: Combines both — a state machine that acts independently and communicates via events

---

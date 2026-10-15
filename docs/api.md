# API Reference

Base URL (local): `http://localhost:3000/api`
All requests and responses use JSON. Dates use the ISO 8601 format (UTC), e.g. `2026-10-20T14:00:00Z`.

## Endpoints

| Method | URL | Description | Success |
|---|---|---|---|
| GET | `/appointments` | List all appointments | 200 |
| GET | `/appointments/:id` | Get one appointment | 200 |
| POST | `/appointments` | Create an appointment | 201 |
| PATCH | `/appointments/:id` | Update an appointment (date, duration, status) | 200 |
| GET | `/patients` | List all patients | 200 |
| POST | `/patients` | Create a patient | 201 |

## Error format

All errors return the same structure:

```json
{ "error": { "code": "NOT_FOUND", "message": "Appointment 42 not found" } }
```

| HTTP status | Error code | Meaning |
|---|---|---|
| 400 | `VALIDATION_ERROR` | The request data does not follow the validation rules |
| 404 | `NOT_FOUND` | The requested resource does not exist |
| 409 | `INVALID_TRANSITION` | The change conflicts with the appointment's current status |

## Details

### GET /appointments

Returns all appointments.

**Request body:** none

**Response 200**
```json
[
  {
    "id": 42,
    "patient_id": 7,
    "doctor_name": "Dr. Martin",
    "scheduled_at": "2026-10-20T14:00:00Z",
    "duration_minutes": 30,
    "consultation_type": "follow_up",
    "status": "scheduled",
    "created_at": "2026-10-14T09:12:00Z"
  },
  {
    "id": 43,
    "patient_id": 3,
    "doctor_name": "Dr. Leroy",
    "scheduled_at": "2026-10-21T09:30:00Z",
    "duration_minutes": 15,
    "consultation_type": "urgent",
    "status": "cancelled",
    "created_at": "2026-10-14T10:05:00Z"
  }
]
```

**Errors:** none expected (an empty list `[]` is a valid response).

### GET /appointments/:id

Returns one appointment.

**Request body:** none

**Response 200**
```json
{
  "id": 42,
  "patient_id": 7,
  "doctor_name": "Dr. Martin",
  "scheduled_at": "2026-10-20T14:00:00Z",
  "duration_minutes": 30,
  "consultation_type": "follow_up",
  "status": "scheduled",
  "created_at": "2026-10-14T09:12:00Z"
}
```

**Errors**
- `400 VALIDATION_ERROR` — `id` is not a positive integer (e.g. `/appointments/abc`)
- `404 NOT_FOUND` — no appointment with this id

### POST /appointments

Creates an appointment. Its status is always `scheduled` on creation; `id`, `status` and `created_at` are set by the server.

**Request body**
```json
{
  "patient_id": 7,
  "doctor_name": "Dr. Martin",
  "scheduled_at": "2026-10-20T14:00:00Z",
  "duration_minutes": 30,
  "consultation_type": "follow_up"
}
```

**Response 201**
```json
{
  "id": 42,
  "patient_id": 7,
  "doctor_name": "Dr. Martin",
  "scheduled_at": "2026-10-20T14:00:00Z",
  "duration_minutes": 30,
  "consultation_type": "follow_up",
  "status": "scheduled",
  "created_at": "2026-10-14T09:12:00Z"
}
```

**Errors**
- `400 VALIDATION_ERROR` — a required field is missing or invalid (e.g. `scheduled_at` in the past, `duration_minutes` outside 15–30, unknown `consultation_type`)
- `400 VALIDATION_ERROR` — `patient_id` does not reference an existing patient

### PATCH /appointments/:id

Updates an appointment. Only `scheduled_at`, `duration_minutes` and `status` can be changed; send only the fields to update.

**Request body** (example: cancel an appointment)
```json
{ "status": "cancelled" }
```

**Request body** (example: reschedule an appointment)
```json
{ "scheduled_at": "2026-10-22T10:00:00Z", "duration_minutes": 15 }
```

**Response 200**
The updated appointment (same format as `GET /appointments/:id`).

**Errors**
- `400 VALIDATION_ERROR` — invalid value, empty body, or a field that cannot be changed (e.g. `patient_id`, `created_at`)
- `404 NOT_FOUND` — no appointment with this id
- `409 INVALID_TRANSITION` — the status change is not allowed (e.g. `completed` → `scheduled`), or the appointment is in a final state and can no longer be modified

### GET /patients

Returns all patients.

**Request body:** none

**Response 200**
```json
[
  { "id": 7, "last_name": "Durand", "first_name": "Marie", "created_at": "2026-10-01T08:30:00Z" },
  { "id": 3, "last_name": "Le Gall", "first_name": "Jean-Pierre", "created_at": "2026-09-28T16:45:00Z" }
]
```

**Errors:** none expected.

### POST /patients

Creates a patient. `id` and `created_at` are set by the server.

**Request body**
```json
{ "last_name": "Durand", "first_name": "Marie" }
```

**Response 201**
```json
{ "id": 7, "last_name": "Durand", "first_name": "Marie", "created_at": "2026-10-01T08:30:00Z" }
```

**Errors**
- `400 VALIDATION_ERROR` — `last_name` or `first_name` is missing, empty, contains digits, or exceeds 100 characters
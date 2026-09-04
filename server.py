# FastAPI Python Backend for Taste of Thanjai POS
# Run with: uvicorn server:app --reload --port 5000

import os
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pymysql

app = FastAPI(title="Taste of Thanjai POS API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "pan123")
DB_NAME = os.getenv("DB_NAME", "biller")

def get_db_connection():
    return pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )

class OrderItem(BaseModel):
    id: str
    name: str
    category: Optional[str] = "General"
    price: float
    qty: int

class CreateOrderRequest(BaseModel):
    id: str
    date: str
    subtotal: Optional[float] = 0
    discount: Optional[float] = 0
    total: float
    payment: str
    status: Optional[str] = "Paid"
    items: List[OrderItem]

class PriceUpdateRequest(BaseModel):
    price: float

@app.get("/api/health")
def health_check():
    try:
        conn = get_db_connection()
        conn.close()
        return {"status": "OK", "database": "Connected", "db_name": DB_NAME}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/menu")
def get_menu():
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM menu_items ORDER BY id ASC")
            menu = cursor.fetchall()
        conn.close()
        return menu
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/menu/{item_id}/price")
def update_price(item_id: str, body: PriceUpdateRequest):
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("UPDATE menu_items SET price = %s WHERE id = %s", (body.price, item_id))
        conn.close()
        return {"success": True, "id": item_id, "price": body.price}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/orders")
def get_orders():
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM orders ORDER BY date DESC")
            orders = cursor.fetchall()
            cursor.execute("SELECT * FROM order_items")
            items = cursor.fetchall()
        conn.close()

        result = []
        for o in orders:
            order_items = [
                {
                    "id": i["item_id"],
                    "name": i["name"],
                    "category": i["category"],
                    "price": float(i["price"]),
                    "qty": i["qty"]
                }
                for i in items if i["order_id"] == o["id"]
            ]
            result.append({
                "id": o["id"],
                "date": str(o["date"]),
                "subtotal": float(o["subtotal"]),
                "discount": float(o["discount"]),
                "total": float(o["total"]),
                "payment": o["payment"],
                "status": o["status"],
                "items": order_items
            })
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/orders")
def create_order(req: CreateOrderRequest):
    try:
        conn = get_db_connection()
        with conn.cursor() as cursor:
            cursor.execute(
                "INSERT INTO orders (id, date, subtotal, discount, total, payment, status) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                (req.id, req.date.replace("T", " ")[:19], req.subtotal or req.total, req.discount or 0, req.total, req.payment, req.status or "Paid")
            )
            for item in req.items:
                cursor.execute(
                    "INSERT INTO order_items (order_id, item_id, name, category, price, qty, line_total) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                    (req.id, item.id, item.name, item.category, item.price, item.qty, item.price * item.qty)
                )
        conn.close()
        return {"success": True, "orderId": req.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

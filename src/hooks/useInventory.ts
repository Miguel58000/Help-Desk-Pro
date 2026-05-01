import { useState, useEffect, useCallback } from 'react';
import type { Producto } from '../types/ticket';
import { db } from '../lib/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { useOrg } from '../context/useOrg';

export function useInventory() {
  const { organizacionActual } = useOrg();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all products for the current organization
   useEffect(() => {
     if (!organizacionActual) {
       // eslint-disable-next-line react-hooks/set-state-in-effect
       setProductos([]);
       return;
     }

    const q = query(
      collection(db, 'productos'),
      where('organizacion', '==', organizacionActual),
      orderBy('nombre', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Producto[];
      setProductos(items);
      setError(null);
    }, (err) => {
      console.error('Error fetching productos:', err);
      setError('No se pudieron cargar los productos');
    });

    return () => unsubscribe();
  }, [organizacionActual]);

  // Add a new product
  const agregarProducto = useCallback(async (productoRaw: Omit<Producto, 'id' | 'fechaCreacion'>) => {
    if (!organizacionActual) throw new Error('No hay organización seleccionada');

    // Build clean object - Firestore doesn't accept undefined
    const producto: Record<string, unknown> = {};
    if (productoRaw.nombre) producto.nombre = productoRaw.nombre;
    if (productoRaw.descripcion) producto.descripcion = productoRaw.descripcion;
    if (typeof productoRaw.cantidad === 'number') producto.cantidad = productoRaw.cantidad;
    if (typeof productoRaw.precioUnitario === 'number') producto.precioUnitario = productoRaw.precioUnitario;
    if (productoRaw.categoria) producto.categoria = productoRaw.categoria;

    setLoading(true);
    try {
      await addDoc(collection(db, 'productos'), {
        ...producto,
        organizacion: organizacionActual,
        fechaCreacion: Date.now(),
      });
      setError(null);
    } catch (err) {
      console.error('Error adding producto:', err);
      setError('Error al agregar producto');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [organizacionActual]);

  // Update product quantity (for stock adjustments)
  const actualizarCantidad = useCallback(async (productoId: string, nuevaCantidad: number) => {
    try {
      const productoRef = doc(db, 'productos', productoId);
      await updateDoc(productoRef, {
        cantidad: nuevaCantidad,
        fechaActualizacion: Date.now(),
      });
    } catch (err) {
      console.error('Error updating cantidad:', err);
      setError('Error al actualizar cantidad');
      throw err;
    }
  }, []);

  // Increase stock (restock)
  const aumentarStock = useCallback(async (productoId: string, cantidad: number) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) throw new Error('Producto no encontrado');

    await actualizarCantidad(productoId, producto.cantidad + cantidad);
  }, [productos, actualizarCantidad]);

  // Decrease stock (use in ticket)
  const disminuirStock = useCallback(async (productoId: string, cantidad: number) => {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) throw new Error('Producto no encontrado');
    if (producto.cantidad < cantidad) {
      throw new Error('Stock insuficiente');
    }

    await actualizarCantidad(productoId, producto.cantidad - cantidad);
  }, [productos, actualizarCantidad]);

  // Get available products (in stock)
  const productosDisponibles = productos.filter(p => p.cantidad > 0);

  // Get product by ID
  const obtenerProducto = (id: string) => productos.find(p => p.id === id);

  return {
    productos,
    productosDisponibles,
    loading,
    error,
    agregarProducto,
    actualizarCantidad,
    aumentarStock,
    disminuirStock,
    obtenerProducto,
  };
}

import { useState, useEffect, useMemo } from 'react';
import type { Producto } from '../../interfaces/producto';

interface Props {
  show: boolean;
  onClose: () => void;
  onSave: (producto: Producto) => void;
  productoToEdit: Producto | null;
}

const ModalProducto = ({ show, onClose, onSave, productoToEdit }: Props) => {
  
  const initialState: Producto = {
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    stock_critico: 10,
    categoria: 'Frutas', // Valor por defecto
    imagen: '',
  };

  const [form, setForm] = useState<Producto>(initialState);
  const isEditMode = useMemo(() => !!productoToEdit, [productoToEdit]);

  // Cargar datos del producto cuando se abre en modo edición
  useEffect(() => {
    if (productoToEdit) {
      setForm(productoToEdit);
    } else {
      setForm(initialState);
    }
  }, [productoToEdit, show]); // Se resetea cada vez que el modal se abre

  // Validaciones
  const errors = useMemo(() => {
    const err: Partial<Record<keyof Producto, string>> = {};
    if (!form.codigo.trim() && !isEditMode) err.codigo = "El código es requerido.";
    if (!form.nombre.trim()) err.nombre = "El nombre es requerido.";
    if (!form.categoria.trim()) err.categoria = "La categoría es requerida.";
    if (form.precio <= 0) err.precio = "El precio debe ser mayor a 0.";
    if (form.stock < 0) err.stock = "El stock no puede ser negativo.";
    if (!form.imagen.trim()) err.imagen = "La ruta de la imagen es requerida (ej: /img/producto.png).";
    
    return err;
  }, [form, isEditMode]);

  const isValid = Object.keys(errors).length === 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    
    // Convertir a número si es necesario
    const valorFinal = (type === 'number') ? Number(value) : value;

    setForm(prev => ({ ...prev, [id]: valorFinal }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSave(form);
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal show" tabIndex={-1} style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{isEditMode ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit} noValidate>
              <div className="row">
                {/* Código */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="codigo" className="form-label">Código (SKU)</label>
                  <input 
                    type="text" 
                    className={`form-control ${errors.codigo ? 'is-invalid' : ''}`} 
                    id="codigo" 
                    value={form.codigo} 
                    onChange={handleChange} 
                    required 
                    disabled={isEditMode} // No se puede editar el código si ya existe
                  />
                  {errors.codigo && <div className="invalid-feedback">{errors.codigo}</div>}
                </div>
                
                {/* Nombre */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="nombre" className="form-label">Nombre del Producto</label>
                  <input 
                    type="text" 
                    className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} 
                    id="nombre" 
                    value={form.nombre} 
                    onChange={handleChange} 
                    required 
                  />
                  {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                </div>

                {/* Descripción */}
                <div className="col-12 mb-3">
                  <label htmlFor="descripcion" className="form-label">Descripción</label>
                  <textarea 
                    className="form-control" 
                    id="descripcion" 
                    rows={3}
                    value={form.descripcion} 
                    onChange={handleChange}
                  ></textarea>
                </div>
                
                {/* Precio */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="precio" className="form-label">Precio</label>
                  <input 
                    type="number" 
                    className={`form-control ${errors.precio ? 'is-invalid' : ''}`} 
                    id="precio" 
                    value={form.precio} 
                    onChange={handleChange} 
                    required 
                  />
                  {errors.precio && <div className="invalid-feedback">{errors.precio}</div>}
                </div>

                {/* Stock */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="stock" className="form-label">Stock</label>
                  <input 
                    type="number" 
                    className={`form-control ${errors.stock ? 'is-invalid' : ''}`} 
                    id="stock" 
                    value={form.stock} 
                    onChange={handleChange} 
                    required 
                  />
                  {errors.stock && <div className="invalid-feedback">{errors.stock}</div>}
                </div>

                {/* Categoría */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="categoria" className="form-label">Categoría</label>
                  <select 
                    className={`form-select ${errors.categoria ? 'is-invalid' : ''}`} 
                    id="categoria" 
                    value={form.categoria} 
                    onChange={handleChange}
                  >
                    {/* Estas categorías vienen del JSON original */}
                    <option value="Frutas">Frutas</option>
                    <option value="Verduras">Verduras</option>
                    <option value="Procesados">Procesados</option>
                    <option value="Lácteos">Lácteos</option>
                  </select>
                  {errors.categoria && <div className="invalid-feedback">{errors.categoria}</div>}
                </div>

                {/* Imagen */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="imagen" className="form-label">Ruta de Imagen</label>
                  <input 
                    type="text" 
                    className={`form-control ${errors.imagen ? 'is-invalid' : ''}`} 
                    id="imagen" 
                    value={form.imagen} 
                    onChange={handleChange} 
                    placeholder="/img/nombre-archivo.png" 
                    required 
                  />
                  {errors.imagen && <div className="invalid-feedback">{errors.imagen}</div>}
                </div>

              </div>
              <div className="modal-footer mt-3">
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                <button type="submit" className="btn btn-success" disabled={!isValid}>Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalProducto;
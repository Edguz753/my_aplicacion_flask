import os
from flask import Flask, render_template, request, jsonify
import pandas as pd

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads' # Carpeta para guardar archivos subidos (opcional)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Límite de 16MB para archivos

# Asegurarse de que la carpeta de subidas exista (si la usas)
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/')
def index():
    """Renderiza la página principal."""
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Maneja la carga de archivos y procesa los datos."""
    if 'file' not in request.files:
        return jsonify({'error': 'No se encontró el archivo'}), 400
    
    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No se seleccionó ningún archivo'}), 400

    if file:
        try:
            # Leer el archivo CSV directamente en un DataFrame de Pandas
            # No es necesario guardarlo si solo lo procesarás en memoria
            df = pd.read_csv(file.stream) 

            # --- Procesamiento Básico de Datos ---
            # Aquí puedes realizar más limpieza o transformación si es necesario
            # Por ahora, solo tomaremos las primeras N filas y columnas para simplificar
            
            # Obtener nombres de columnas y algunos datos de ejemplo para el gráfico
            # Asegúrate de que el CSV tenga encabezados
            if df.empty:
                return jsonify({'error': 'El archivo CSV está vacío o no tiene encabezados'}), 400

            # Tomar las primeras 10 filas como máximo para el ejemplo
            df_sample = df.head(10) 
            
            # Intentar seleccionar columnas numéricas para el gráfico (simplificación)
            # Esto es un ejemplo, deberías permitir al usuario seleccionar columnas
            numeric_cols = df_sample.select_dtypes(include=['number']).columns.tolist()
            
            if not numeric_cols:
                return jsonify({'error': 'No se encontraron columnas numéricas para graficar en las primeras filas.'}), 400

            # Para el ejemplo, usaremos la primera columna no numérica como etiquetas
            # y la primera columna numérica como datos.
            # ¡Esto debería ser más robusto en una aplicación real!
            
            label_column = None
            for col in df_sample.columns:
                if col not in numeric_cols:
                    label_column = col
                    break
            
            if not label_column and not df_sample.index.name: # Usar el índice si no hay columnas de texto
                labels = df_sample.index.astype(str).tolist()
            elif not label_column and df_sample.index.name:
                labels = df_sample.index.astype(str).tolist()
            else:
                labels = df_sample[label_column].astype(str).tolist()

            data_column = numeric_cols[0] # Tomar la primera columna numérica
            data_values = df_sample[data_column].tolist()

            chart_data = {
                'labels': labels,
                'datasets': [{
                    'label': f'Datos de {data_column}',
                    'data': data_values,
                    'backgroundColor': 'rgba(75, 192, 192, 0.2)',
                    'borderColor': 'rgba(75, 192, 192, 1)',
                    'borderWidth': 1
                }]
            }
            
            # Devolver los nombres de las columnas y los datos procesados
            return jsonify({
                'message': 'Archivo procesado exitosamente',
                'columns': df.columns.tolist(), 
                'chartData': chart_data
            })

        except Exception as e:
            return jsonify({'error': f'Error al procesar el archivo: {str(e)}'}), 500
    
    return jsonify({'error': 'Error desconocido'}), 500

if __name__ == '__main__':
    app.run(debug=True)
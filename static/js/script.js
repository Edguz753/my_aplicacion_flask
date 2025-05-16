document.addEventListener('DOMContentLoaded', function () {
    const uploadForm = document.getElementById('uploadForm');
    const fileInput = document.getElementById('fileInput');
    const feedbackDiv = document.getElementById('feedback');
    const columnList = document.getElementById('columnList');
    const chartCanvas = document.getElementById('myChart');
    let myChart = null; // Variable para almacenar la instancia del gráfico

    uploadForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // Evitar el envío tradicional del formulario
        feedbackDiv.textContent = '';
        columnList.innerHTML = '';

        const formData = new FormData();
        formData.append('file', fileInput.files[0]);

        try {
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                feedbackDiv.textContent = result.message || 'Archivo cargado.';
                feedbackDiv.className = 'feedback success';

                // Mostrar nombres de columnas
                if (result.columns && result.columns.length > 0) {
                    result.columns.forEach(column => {
                        const li = document.createElement('li');
                        li.textContent = column;
                        columnList.appendChild(li);
                    });
                }

                // Crear o actualizar el gráfico
                if (result.chartData) {
                    renderChart(result.chartData);
                } else {
                     if (myChart) { // Destruir gráfico anterior si existe
                        myChart.destroy();
                        myChart = null;
                    }
                    console.warn("No se recibieron datos para el gráfico desde el backend.");
                }

            } else {
                feedbackDiv.textContent = 'Error: ' + (result.error || 'No se pudo procesar el archivo.');
                feedbackDiv.className = 'feedback error';
                 if (myChart) { // Destruir gráfico anterior si existe
                    myChart.destroy();
                    myChart = null;
                }
            }

        } catch (error) {
            console.error('Error en la petición:', error);
            feedbackDiv.textContent = 'Error de conexión o en el servidor.';
            feedbackDiv.className = 'feedback error';
            if (myChart) { // Destruir gráfico anterior si existe
                myChart.destroy();
                myChart = null;
            }
        }
    });

    function renderChart(chartData) {
        const ctx = chartCanvas.getContext('2d');

        // Si ya existe un gráfico, destrúyelo antes de crear uno nuevo
        if (myChart) {
            myChart.destroy();
        }

        // Crear un nuevo gráfico (ejemplo: gráfico de barras)
        myChart = new Chart(ctx, {
            type: 'bar', // Puedes cambiar el tipo: 'line', 'pie', 'radar', etc.
            data: {
                labels: chartData.labels, // Etiquetas para el eje X
                datasets: chartData.datasets // Datos para graficar
                /*
                Ejemplo de estructura para datasets:
                datasets: [{
                    label: 'Mi Conjunto de Datos', // Nombre de la serie
                    data: chartData.values,       // Valores para el eje Y
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
                */
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Visualización de Datos del CSV'
                    }
                },
                // Opciones de interactividad (Chart.js ya es interactivo por defecto)
                // Puedes personalizar tooltips, eventos de clic, etc.
                // Ejemplo:
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const clickedElementIndex = elements[0].index;
                        const datasetIndex = elements[0].datasetIndex;
                        const label = myChart.data.labels[clickedElementIndex];
                        const value = myChart.data.datasets[datasetIndex].data[clickedElementIndex];
                        console.log(`Clickeado: Etiqueta='${label}', Valor=${value}`);
                        // Aquí podrías mostrar más detalles o realizar otra acción
                    }
                }
            }
        });
    }
});
import mysql.connector

def importar_sql(ruta_sql):
    try:
        conexion = mysql.connector.connect(
            host='localhost',
            user='root',
            password='12345'
        )
        cursor = conexion.cursor()

        with open(ruta_sql, 'r', encoding='utf-8') as archivo:
            contenido_sql = archivo.read()
            for resultado in cursor.execute(contenido_sql, multi=True):
                pass  # Ejecuta cada instrucción

        conexion.commit()
        print("✔ Base de datos importada correctamente.")

    except mysql.connector.Error as err:
        print(f"❌ Error: {err}")

    finally:
        if conexion.is_connected():
            cursor.close()
            conexion.close()

# Llama la función con la ruta correcta al archivo
importar_sql("db/edunet-BaseDatos.sql")






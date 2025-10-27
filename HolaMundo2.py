# Ejecución:
# 1 Abrir CMD/PowerShell
# 2 cd "c:\Users\ASUS\Downloads\Proyecto-Desarrollo-Web-Avanzada"
# 3 python HolaMundo2.py
# Si Windows no reconoce 'python' usar: py HolaMundo2.py
def greet(name):
    return f"Hola, {name}!"

def name_info(name):
    return len(name), name[::-1]

if __name__ == "__main__":
    nombre = input("Ingresa tu nombre (o presiona Enter para 'Mundo'): ").strip() or "Mundo"
    print(greet(nombre))
    longitud, invertido = name_info(nombre)
    print(f"Tu nombre tiene {longitud} caracteres.")
    print(f"Tu nombre al revés: {invertido}")
    # Pausa para que la ventana de la consola no se cierre inmediatamente (útil al hacer doble clic)
    input("Presiona Enter para salir...")
# 🔄 Flujo de trabajo
Git push origin main ya no funcionará y te dará error. 

Tu forma de trabajar cambiará a este ciclo:

1) Usa la rama con tu apellido:
git checkout -b mi-apellido

2) Hacer cambios y commits en esa rama:
git add .
git commit -m "Agregando nueva funcionalidad"

3) Subir esa rama al servidor:
git push origin mi-nueva-funcionalidad

Crear un Pull Request (PR): Vas a la web (GitHub/GitLab) y verás un botón para crear el "Pull Request" desde tu rama hacia main. Una vez revisado, le das al botón "Merge" en la web.
#Algorithm

    Это файл для запуска процесса запаковки файлов из командной строки.

    На вход принимает два атрибута:
    -i "путь" - в какой папке собирать языки
    -o "путь" - куда записать результат

    Алгоритм:
    1. Проверяем путь -i. 
      - Если указан невалидный путь или не указан совсем, прерываем выполнение с оответствущей ошибкой
      - Если указан путь до файла, прерываем пусть с оответствущей ошибкой
      - Если указан путь до каталога .lang то сразу начинаем обработку его как каталога с языками.
      - Если другое, то начинаем сканировать все элементы папки в поисках папок .lang рекурсивно. Как только нашли, начинаем извлекать языковые файлы.
    2. В качестве языковых файлов идут только файлы с расширением .json. Ищем так же рекурсивно с запоминанием пути файла.
    3. Как только нашли файл json, проверяем его имя, соответствует ли какому-либо языку из lang.js файла. 
       Если ок, то берем его содержимое и, опять же рекурсивно, записываем в результирующий объект языков.
    4. После того, как все папки проинспектированы, должна получится двухуровневая мапа следующего вида:
    "<путь до каталога с файлом>:<путь до элемента в json>": {
        "ключ": "перевод"
    }
    проходим по всей результирующей мапе переводов, и формеруем файлы вида `untill<код языка>.lng`.
    

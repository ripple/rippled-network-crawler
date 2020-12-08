FROM node:12

RUN mkdir scratch
ADD . / scratch/
RUN npm --prefix scratch install

FROM node:12-alpine

RUN mkdir -p /crawler
COPY --from=0 /scratch /crawler
COPY entrypoint.sh /crawler/entrypoint.sh
RUN chmod +x /crawler/entrypoint.sh
WORKDIR /crawler

CMD /crawler/entrypoint.sh

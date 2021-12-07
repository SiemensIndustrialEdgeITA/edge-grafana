#
ARG BASE_IMAGE=alpine:3.15
#ARG BASE_IMAGE=node:14-alpine
FROM ${BASE_IMAGE}

ARG GRAFANA_VERSION=8.2.5
ARG GF_UID="472"
ARG GF_GID="472"

USER root

ENV PATH=/usr/share/grafana/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
    GF_PATHS_CONFIG="/etc/grafana/grafana.ini" \
    GF_PATHS_DATA="/var/lib/grafana" \
    GF_PATHS_HOME="/usr/share/grafana" \
    GF_PATHS_LOGS="/var/log/grafana" \
    GF_PATHS_PLUGINS="/etc/grafana/plugins" \
    GF_PATHS_PROVISIONING="/etc/grafana/provisioning"


WORKDIR $GF_PATHS_HOME

RUN apk add --no-cache ca-certificates bash tzdata && \
    apk add --no-cache --upgrade --repository=http://dl-cdn.alpinelinux.org/alpine/edge/main openssl musl-utils

# Install tools, create Node-RED app and data dir, add user and set rights
RUN set -ex && \
    apk add --no-cache \
        bash \
        iputils \
        git \
        perl


# Oracle Support for x86_64 only
RUN if [ `arch` = "x86_64" ]; then \
      apk add --no-cache --upgrade --repository=http://dl-cdn.alpinelinux.org/alpine/edge/community libaio libnsl && \
      ln -s /usr/lib/libnsl.so.2 /usr/lib/libnsl.so.1 && \
      wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.30-r0/glibc-2.30-r0.apk \
        -O /tmp/glibc-2.30-r0.apk && \
      wget https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.30-r0/glibc-bin-2.30-r0.apk \
        -O /tmp/glibc-bin-2.30-r0.apk && \
      apk add --allow-untrusted /tmp/glibc-2.30-r0.apk /tmp/glibc-bin-2.30-r0.apk && \
      rm -f /tmp/glibc-2.30-r0.apk && \
      rm -f /tmp/glibc-bin-2.30-r0.apk && \
      rm -f /lib/ld-linux-x86-64.so.2 && \
      rm -f /etc/ld.so.cache; \
    fi

# PhantomJS
RUN if [ `arch` = "x86_64" ]; then \
      apk add --no-cache --virtual phantomjs-utils curl && \
      cd /tmp && \
      curl -Ls https://github.com/dustinblackman/phantomized/releases/download/2.1.1/dockerized-phantomjs.tar.gz | tar xz && \
      cp -R lib lib64 / && \
      cp -R usr/lib/x86_64-linux-gnu /usr/lib && \
      cp -R usr/share/fonts /usr/share && \
      cp -R etc/fonts /etc && \
      rm -rf /tmp/* && \
      apk del --no-cache phantomjs-utils; \
    fi


# grafana package to be copied from host
ARG GRAFANA_TGZ="grafana-8.2.5.linux-amd64.tar.xz"
COPY ${GRAFANA_TGZ} /tmp/grafana.tar.xz

# Change to tar xfzv to make tar print every file it extracts
RUN mkdir /tmp/grafana && tar xf /tmp/grafana.tar.xz --strip-components=2 -C /tmp/grafana

RUN ls /tmp/grafana && echo $GF_PATHS_HOME && \
    cp -r /tmp/grafana/* "$GF_PATHS_HOME" && \
    rm -rf /tmp/* 

RUN  ls "$GF_PATHS_HOME"
RUN addgroup -S -g $GF_GID grafana && \
    adduser -S -u $GF_UID -G root grafana && \
    mkdir -p "$GF_PATHS_PROVISIONING/datasources" \
             "$GF_PATHS_PROVISIONING/dashboards" \
             "$GF_PATHS_PROVISIONING/notifiers" \
             "$GF_PATHS_LOGS" \
             "$GF_PATHS_PLUGINS" \
             "$GF_PATHS_DATA" && \
    cp "$GF_PATHS_HOME/conf/sample.ini" "$GF_PATHS_CONFIG" && \
    cp "$GF_PATHS_HOME/conf/ldap.toml" /etc/grafana/ldap.toml && \
    cp -R "$GF_PATHS_HOME/conf/provisioning/datasources" "$GF_PATHS_PROVISIONING" && \
    cp -R "$GF_PATHS_HOME/conf/provisioning/dashboards" "$GF_PATHS_PROVISIONING" && \
    cp -R "$GF_PATHS_HOME/conf/provisioning/notifiers" "$GF_PATHS_PROVISIONING" && \
    ls "$GF_PATHS_PROVISIONING" && ls "$GF_PATHS_PROVISIONING/dashboards" &&\
    chown -R grafana:root "$GF_PATHS_DATA" "$GF_PATHS_HOME" "$GF_PATHS_LOGS" "$GF_PATHS_PLUGINS" "$GF_PATHS_PROVISIONING" && \
    chmod -R 777 "$GF_PATHS_DATA" "$GF_PATHS_HOME" "$GF_PATHS_LOGS" "$GF_PATHS_PLUGINS" "$GF_PATHS_PROVISIONING"


ENV GF_INSTALL_PLUGINS="grafana-clock-panel,natel-plotly-panel,\
michaeldmoore-multistat-panel,yesoreyeram-boomtable-panel,\
farski-blendstat-panel,michaeldmoore-annunciator-panel,larona-epict-panel,\
blackmirror1-singlestat-math-panel,vonage-status-panel,grafana-piechart-panel,\
isaozler-paretochart-panel,ryantxu-ajax-panel,volkovlabs-image-panel,briangann-datatable-panel,\
integrationmatters-comparison-panel,agenty-flowcharting-panel,marcusolsson-dynamictext-panel,\
natel-discrete-panel,marcusolsson-gantt-panel,snuids-trafficlights-panel" 

RUN if [ ! -z "${GF_INSTALL_PLUGINS}" ]; then \
    OLDIFS=$IFS; \
        IFS=','; \
    for plugin in ${GF_INSTALL_PLUGINS}; do \
        IFS=$OLDIFS; \
        grafana-cli --pluginsDir "$GF_PATHS_PLUGINS" plugins install ${plugin}; \
    done; \
fi

# install industrialedge-dataservice-datasource
COPY industrialedge-dataservice-datasource /etc/grafana/plugins/industrialedge-dataservice-datasource

EXPOSE 3000

COPY ./run.sh ./run.sh

#USER grafana
ENV GF_RENDERER_PLUGIN_CHROME_BIN="/usr/bin/chromium-browser"
ENV GF_INSTALL_IMAGE_RENDERER_PLUGIN="false"


ENTRYPOINT [ "./run.sh" ]